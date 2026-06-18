export function getKafkaBrokers(): string[] {
  return (process.env.KAFKA_BROKERS || '127.0.0.1:9092')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);
}

export function getKafkaClientId(): string {
  return process.env.KAFKA_CLIENT_ID || 'ebook-generator';
}

export function getKafkaConsumerGroupId(): string {
  return process.env.KAFKA_GROUP_ID || 'ebook-generator-newsletter-consumers';
}

/** Incoming topic — blog_service publishes NEWS_LETTER_PDF events here. */
export function getNewsletterPdfTopic(): string {
  return process.env.KAFKA_TOPIC_NEWSLETTER_PDF || 'NEWS_LETTER_PDF';
}

export function getNewsletterPdfCompletedTopic(): string {
  return process.env.KAFKA_TOPIC_NEWSLETTER_PDF_COMPLETED || 'NEWS_LETTER_PDF_COMPLETED';
}

export function getNewsletterPdfFailedTopic(): string {
  return process.env.KAFKA_TOPIC_NEWSLETTER_PDF_FAILED || 'NEWS_LETTER_PDF_FAILED';
}

/** Internal topic — PDF worker notifies URL producer that a public URL is ready. */
export function getNewsletterPdfReadyTopic(): string {
  return process.env.KAFKA_TOPIC_NEWSLETTER_PDF_READY || 'NEWS_LETTER_PDF_READY';
}

/** Outbound topic — URL producer sends Cloudinary/public URL to downstream consumers. */
export function getNewsletterPdfPublicUrlTopic(): string {
  return process.env.KAFKA_TOPIC_NEWSLETTER_PDF_PUBLIC_URL || 'NEWS_LETTER_PDF_PUBLIC_URL';
}

/** blog_service → ebook: batch PDF request topic. */
export function getBlogBatchRequestTopic(): string {
  return process.env.KAFKA_BLOG_BATCH_REQUEST_TOPIC || 'newsletter-delivery';
}

/** ebook → blog_service: PDF ready with public URL. */
export function getBlogPdfReadyTopic(): string {
  return process.env.KAFKA_BLOG_PDF_READY_TOPIC || 'newsletter-pdf-ready';
}

export function getUrlProducerGroupId(): string {
  return process.env.KAFKA_URL_PRODUCER_GROUP_ID || 'ebook-generator-url-producers';
}

export function getPublicUrlConsumerGroupId(): string {
  return process.env.KAFKA_PUBLIC_URL_CONSUMER_GROUP_ID || 'ebook-generator-public-url-consumers';
}

/** @deprecated Use getNewsletterPdfTopic */
export function getBlogPdfTopic(): string {
  return getNewsletterPdfTopic();
}

export function getBlogPdfCompletedTopic(): string {
  return getNewsletterPdfCompletedTopic();
}

export function getBlogPdfFailedTopic(): string {
  return getNewsletterPdfFailedTopic();
}
