import '../lib/utils/bootstrapEnv';

import { Kafka, type Consumer } from 'kafkajs';
import {
  getNewsletterPdfTopic,
  getBlogBatchRequestTopic,
  getKafkaBrokers,
  getKafkaClientId,
  getKafkaConsumerGroupId,
} from '../lib/kafka/config';
import { ensureKafkaTopicsWithRetry } from '../lib/kafka/ensureTopics';
import { handleBlogPdfEvent } from '../lib/kafka/handleBlogPdfEvent';
import { handleBlogBatchEvent } from '../lib/kafka/handleBlogBatchEvent';
import { disconnectKafkaProducer } from '../lib/kafka/producer';
import { isBlogBatchRequestEvent } from '../lib/kafka/blogServiceTypes';
import { isNewsletterPdfGenerateEvent } from '../lib/kafka/types';

let consumer: Consumer | null = null;
let shuttingDown = false;

async function startConsumer(): Promise<void> {
  await ensureKafkaTopicsWithRetry();

  const kafka = new Kafka({
    clientId: getKafkaClientId(),
    brokers: getKafkaBrokers(),
  });

  consumer = kafka.consumer({
    groupId: getKafkaConsumerGroupId(),
    // PDF jobs can run several minutes; default 30s session causes coordinator errors.
    sessionTimeout: 900_000,
    rebalanceTimeout: 900_000,
    heartbeatInterval: 15_000,
  });
  await consumer.connect();

  const testTopic = getNewsletterPdfTopic();
  const blogTopic = getBlogBatchRequestTopic();
  await consumer.subscribe({ topics: [testTopic, blogTopic], fromBeginning: false });

  console.log(`[kafka-blog] Listening on topics "${testTopic}", "${blogTopic}"`);
  console.log(`[kafka-blog] Brokers: ${getKafkaBrokers().join(', ')}`);
  console.log(`[kafka-blog] Group: ${getKafkaConsumerGroupId()}`);

  await consumer.run({
    eachMessage: async ({ topic: msgTopic, partition, message }) => {
      if (shuttingDown || !message.value) return;

      const raw = message.value.toString();
      let parsed: unknown;

      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error(`[kafka-blog] Invalid JSON on ${msgTopic}[${partition}]:`, raw.slice(0, 200));
        return;
      }

      if (msgTopic === blogTopic && isBlogBatchRequestEvent(parsed)) {
        console.log(`[kafka-blog] Received blog_service batch ${parsed.eventId}`);
        try {
          await handleBlogBatchEvent(parsed);
        } catch (err) {
          console.error(
            `[kafka-blog] Failed batch ${parsed.eventId}:`,
            err instanceof Error ? err.message : err
          );
        }
        return;
      }

      if (!isNewsletterPdfGenerateEvent(parsed)) {
        console.warn(`[kafka-blog] Ignoring unknown event:`, raw.slice(0, 200));
        return;
      }

      console.log(`[kafka-blog] Received event ${parsed.eventId} for blog ${parsed.blogId}`);

      try {
        await handleBlogPdfEvent(parsed);
      } catch (err) {
        console.error(
          `[kafka-blog] Failed event ${parsed.eventId}:`,
          err instanceof Error ? err.message : err
        );
      }
    },
  });
}

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[kafka-blog] Shutting down…');
  await consumer?.disconnect().catch(() => {});
  await disconnectKafkaProducer().catch(() => {});
}

process.on('SIGINT', () => {
  shutdown().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  shutdown().finally(() => process.exit(0));
});

startConsumer().catch((err) => {
  console.error('[kafka-blog] Fatal:', err);
  process.exit(1);
});
