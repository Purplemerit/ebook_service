import { Kafka, type Producer } from 'kafkajs';
import {
  getBlogPdfCompletedTopic,
  getBlogPdfFailedTopic,
  getBlogPdfReadyTopic,
  getBlogBatchRequestTopic,
  getKafkaBrokers,
  getKafkaClientId,
  getNewsletterPdfReadyTopic,
  getNewsletterPdfPublicUrlTopic,
} from './config';
import type {
  BlogPdfCompletedEvent,
  BlogPdfFailedEvent,
  NewsletterPdfPublicUrlEvent,
  NewsletterPdfReadyEvent,
} from './types';
import type { BlogPdfReadyEvent } from './blogServiceTypes';

let producer: Producer | null = null;

async function getProducer(): Promise<Producer> {
  if (!producer) {
    const kafka = new Kafka({
      clientId: getKafkaClientId(),
      brokers: getKafkaBrokers(),
    });
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
}

export async function publishBlogPdfCompleted(event: BlogPdfCompletedEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: getBlogPdfCompletedTopic(),
    messages: [
      {
        key: event.blogId,
        value: JSON.stringify(event),
      },
    ],
  });
}

export async function publishBlogPdfFailed(event: BlogPdfFailedEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: getBlogPdfFailedTopic(),
    messages: [
      {
        key: event.blogId,
        value: JSON.stringify(event),
      },
    ],
  });
}

export async function publishPdfReady(event: NewsletterPdfReadyEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: getNewsletterPdfReadyTopic(),
    messages: [{ key: event.blogId, value: JSON.stringify(event) }],
  });
}

export async function publishPublicPdfUrl(event: NewsletterPdfPublicUrlEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: getNewsletterPdfPublicUrlTopic(),
    messages: [{ key: event.blogId, value: JSON.stringify(event) }],
  });
}

/** Publish newsletter.pdf.ready for blog_service to consume. */
export async function publishBlogPdfReady(event: BlogPdfReadyEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: getBlogPdfReadyTopic(),
    messages: [{ key: event.deliveryId, value: JSON.stringify(event) }],
  });
}

export async function disconnectKafkaProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}
