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
