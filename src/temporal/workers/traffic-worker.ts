import { NativeConnection, Worker } from '@temporalio/worker';
import { trafficMonitoringActivities } from '../activities/traffic-monitoring-activities';

async function runWorker() {
  // Create connection to Temporal server
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_SERVER_ADDRESS || 'localhost:7233',
  });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue: 'traffic-monitoring-queue',

    workflowsPath: require.resolve('../workflows'),

    activities: trafficMonitoringActivities,

    maxConcurrentActivityTaskExecutions: 100,
    maxConcurrentWorkflowTaskExecutions: 100,
  });
  
  await worker.run();
}

// Handle worker shutdown gracefully
process.on('SIGINT', () => {
  console.log('💫 Shutting down traffic monitoring worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('💫 Shutting down traffic monitoring worker...');
  process.exit(0);
});

runWorker().catch((err) => {
  console.error('❌ Worker failed:', err);
  process.exit(1);
});
