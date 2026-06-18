/**
 * Consumes NEWS_LETTER_PDF_READY (PDF + Cloudinary URL ready)
 * and publishes NEWS_LETTER_PDF_PUBLIC_URL for downstream consumers.
 */
import '../lib/utils/bootstrapEnv';

import { Kafka, type Consumer } from 'kafkajs';
import {
  getKafkaBrokers,
  getKafkaClientId,
  getNewsletterPdfPublicUrlTopic,
  getNewsletterPdfReadyTopic,
  getUrlProducerGroupId,
} from '../lib/kafka/config';
import { ensureKafkaTopicsWithRetry } from '../lib/kafka/ensureTopics';
import {
  disconnectKafkaProducer,
  publishBlogPdfCompleted,
  publishPublicPdfUrl,
} from '../lib/kafka/producer';
import {
  isNewsletterPdfReadyEvent,
  NEWSLETTER_PDF_COMPLETED_EVENT,
  NEWSLETTER_PDF_PUBLIC_URL_EVENT,
} from '../lib/kafka/types';

let consumer: Consumer | null = null;
let shuttingDown = false;

async function startProducer(): Promise<void> {
  await ensureKafkaTopicsWithRetry();

  const kafka = new Kafka({
    clientId: `${getKafkaClientId()}-url-producer`,
    brokers: getKafkaBrokers(),
  });

  consumer = kafka.consumer({ groupId: getUrlProducerGroupId() });
  await consumer.connect();

  const readyTopic = getNewsletterPdfReadyTopic();
  const publicTopic = getNewsletterPdfPublicUrlTopic();

  await consumer.subscribe({ topic: readyTopic, fromBeginning: false });

  console.log(`[kafka-url-producer] Brokers: ${getKafkaBrokers().join(', ')}`);
  console.log(`[kafka-url-producer] Consume: ${readyTopic}`);
  console.log(`[kafka-url-producer] Publish: ${publicTopic}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (shuttingDown || !message.value) return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(message.value.toString());
      } catch {
        console.error('[kafka-url-producer] Invalid JSON');
        return;
      }

      if (!isNewsletterPdfReadyEvent(parsed)) {
        console.warn('[kafka-url-producer] Ignoring unknown event');
        return;
      }

      const publishedAt = new Date().toISOString();

      await publishPublicPdfUrl({
        eventType: NEWSLETTER_PDF_PUBLIC_URL_EVENT,
        eventId: parsed.eventId,
        blogId: parsed.blogId,
        downloadUrl: parsed.downloadUrl,
        publishedAt,
      });

      await publishBlogPdfCompleted({
        eventType: NEWSLETTER_PDF_COMPLETED_EVENT,
        eventId: parsed.eventId,
        blogId: parsed.blogId,
        filename: parsed.filename,
        pageCount: parsed.pageCount,
        downloadUrl: parsed.downloadUrl,
        completedAt: publishedAt,
      });

      console.log(
        `[kafka-url-producer] Published public URL for ${parsed.eventId} → ${parsed.downloadUrl}`
      );
    },
  });
}

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[kafka-url-producer] Shutting down…');
  await consumer?.disconnect().catch(() => {});
  await disconnectKafkaProducer().catch(() => {});
}

process.on('SIGINT', () => {
  shutdown().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  shutdown().finally(() => process.exit(0));
});

startProducer().catch((err) => {
  console.error('[kafka-url-producer] Fatal:', err);
  process.exit(1);
});
