import cron from 'node-cron';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const reactivateSuspendedUsersJob = () => {
  cron.schedule('*/5 * * * *', () => {
    console.log('⏰ Scheduling suspended user reactivation job in worker...');

    // Resolve path relative to THIS file, not the process CWD
    const workerPath = path.resolve(__dirname, '../worker/reactivateSuspendedUserWorker');

    const worker = new Worker(workerPath);

    worker.on('message', (msg) => {
      console.log('📩 Worker message:', msg);
    });

    worker.on('error', (err) => {
      console.error('❌ Worker thread error:', err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`⚠ Worker stopped with exit code ${code}`);
      }
    });
  });
};
