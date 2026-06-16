import '../lib/utils/bootstrapEnv';

import { ensureKafkaTopicsWithRetry } from '../lib/kafka/ensureTopics';
import {
  getKafkaBrokers,
  getNewsletterPdfCompletedTopic,
  getNewsletterPdfFailedTopic,
  getNewsletterPdfTopic,
} from '../lib/kafka/config';

async function main() {
  await ensureKafkaTopicsWithRetry();
  console.log('[kafka] Ready. Topics:');
  console.log(`  - ${getNewsletterPdfTopic()}`);
  console.log(`  - ${getNewsletterPdfCompletedTopic()}`);
  console.log(`  - ${getNewsletterPdfFailedTopic()}`);
  console.log(`[kafka] Brokers: ${getKafkaBrokers().join(', ')}`);
}

main().catch((err) => {
  console.error('[kafka] Failed to create topics:', err);
  process.exit(1);
});
