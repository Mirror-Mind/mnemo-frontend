import path from 'path';
import Graceful from '@ladjs/graceful';
import Cabin from 'cabin';
import Bree from 'bree';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Started job scheduler");

const bree = new Bree({
  logger: new Cabin(),
  root: path.join(__dirname, 'jobs'),
  // Enable worker logs to be displayed in main process
  workerMessageHandler: (message) => {
    console.log(`[Worker] ${JSON.stringify(message)}`);
  },
  // Capture worker output
  worker: {
    workerData: {
      enableWorkerLogs: true
    }
  },
  jobs: [
    {
      name: 'morning-combined',
      interval: 'at 9:20 am Asia/Kolkata',
      worker: {
        cwd: process.cwd()
      }
    },
  ]   
});

// Handle worker messages
bree.on('worker created', (name) => {
  console.log(`[Bree] Worker created for job: ${name}`);
});

bree.on('worker deleted', (name) => {
  console.log(`[Bree] Worker deleted for job: ${name}`);
});

const graceful = new Graceful({ brees: [bree] });
graceful.listen();

await bree.start();