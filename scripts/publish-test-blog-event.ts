/**
 * Publish a sample NEWS_LETTER_PDF event for local testing.
 * Usage: npm run kafka:test-publish -- lavender
 */
import '../lib/utils/bootstrapEnv';

import { Kafka } from 'kafkajs';
import { getKafkaBrokers, getKafkaClientId, getNewsletterPdfTopic } from '../lib/kafka/config';
import { ensureKafkaTopicsWithRetry } from '../lib/kafka/ensureTopics';
import {
  NEWSLETTER_PDF_EVENT,
  type NewsletterPdfGenerateEvent,
  resolveBlogTheme,
} from '../lib/kafka/types';

async function main() {
  const theme = resolveBlogTheme(process.argv[2]);

  const event: NewsletterPdfGenerateEvent = {
    eventType: NEWSLETTER_PDF_EVENT,
    eventId: `test-${Date.now()}`,
    blogId: 'blog-001',
    title: 'Getting Started with Kafka',
    author: 'Jane Doe',
    excerpt: 'A short guide to event-driven PDF generation.',
    content: `Kafka lets services communicate asynchronously.

When blog_service publishes an event, ebook-generator creates a styled PDF automatically.

This sample uses the ${theme} theme with cover and body pages.`,
    theme,
    dimensions: 'a4',
    requestedAt: new Date().toISOString(),
  };

  await ensureKafkaTopicsWithRetry();

  const kafka = new Kafka({
    clientId: getKafkaClientId(),
    brokers: getKafkaBrokers(),
  });
  const producer = kafka.producer();
  await producer.connect();

  const topic = getNewsletterPdfTopic();
  await producer.send({
    topic,
    messages: [{ key: event.blogId, value: JSON.stringify(event) }],
  });

  console.log(`Published to ${topic}:`, event.eventId, `(theme: ${theme})`);
  await producer.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
