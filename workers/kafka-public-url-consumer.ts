/**
 * Downstream consumer — receives NEWS_LETTER_PDF_PUBLIC_URL events
 * (simulates sir's service or any external app listening for PDF URLs).
 */
import '../lib/utils/bootstrapEnv';

import { Kafka, type Consumer } from 'kafkajs';
import {
  getKafkaBrokers,
  getKafkaClientId,
  getNewsletterPdfPublicUrlTopic,
  getPublicUrlConsumerGroupId,
} from '../lib/kafka/config';
import { ensureKafkaTopicsWithRetry } from '../lib/kafka/ensureTopics';
import { isNewsletterPdfPublicUrlEvent } from '../lib/kafka/types';

let consumer: Consumer | null = null;
let shuttingDown = false;

async function startConsumer(): Promise<void> {
  await ensureKafkaTopicsWithRetry();

  const kafka = new Kafka({
    clientId: `${getKafkaClientId()}-public-url-consumer`,
    brokers: getKafkaBrokers(),
  });

  consumer = kafka.consumer({ groupId: getPublicUrlConsumerGroupId() });
  await consumer.connect();

  const topic = getNewsletterPdfPublicUrlTopic();
  await consumer.subscribe({ topic, fromBeginning: false });

  console.log(`[kafka-public-url-consumer] Brokers: ${getKafkaBrokers().join(', ')}`);
  console.log(`[kafka-public-url-consumer] Listening on: ${topic}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (shuttingDown || !message.value) return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(message.value.toString());
      } catch {
        console.error('[kafka-public-url-consumer] Invalid JSON');
        return;
      }

      if (!isNewsletterPdfPublicUrlEvent(parsed)) {
        console.warn('[kafka-public-url-consumer] Ignoring unknown event');
        return;
      }

      console.log('[kafka-public-url-consumer] Received public PDF URL:');
      console.log(`  eventId:     ${parsed.eventId}`);
      console.log(`  blogId:      ${parsed.blogId}`);
      console.log(`  downloadUrl: ${parsed.downloadUrl}`);
      console.log(`  publishedAt: ${parsed.publishedAt}`);
    },
  });
}

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[kafka-public-url-consumer] Shutting down…');
  await consumer?.disconnect().catch(() => {});
}

process.on('SIGINT', () => {
  shutdown().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  shutdown().finally(() => process.exit(0));
});

startConsumer().catch((err) => {
  console.error('[kafka-public-url-consumer] Fatal:', err);
  process.exit(1);
});
