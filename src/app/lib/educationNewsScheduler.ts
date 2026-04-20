import 'server-only';

import cron from 'node-cron';

import { refreshEducationNews } from '@/app/lib/educationNews';

declare global {
  var __educationNewsCronStarted: boolean | undefined;
}

const schedule = process.env.EDUCATION_NEWS_CRON_SCHEDULE?.trim() || '0 */6 * * *';
const timezone = process.env.EDUCATION_NEWS_CRON_TZ?.trim() || 'Asia/Karachi';

export const startEducationNewsCron = () => {
  if (globalThis.__educationNewsCronStarted) {
    return;
  }

  if (!cron.validate(schedule)) {
    console.warn(`[education-news] Invalid cron schedule: ${schedule}`);
    return;
  }

  globalThis.__educationNewsCronStarted = true;

  cron.schedule(
    schedule,
    async () => {
      try {
        await refreshEducationNews();
        console.log('[education-news] News cache refreshed successfully.');
      } catch (error) {
        console.error('[education-news] Cron refresh failed.', error);
      }
    },
    { timezone },
  );
};
