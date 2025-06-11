import { Client, Connection } from '@temporalio/client';

// Temporal client configuration
export async function createTemporalClient(): Promise<Client> {
  // For local development
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_SERVER_ADDRESS || 'localhost:7233',
  });

  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  });

  return client;
}

// Helper function to get client (singleton pattern)
let clientInstance: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (!clientInstance) {
    clientInstance = await createTemporalClient();
  }
  return clientInstance;
} 