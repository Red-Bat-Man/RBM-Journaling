import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create a PostgreSQL client
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// For use with drizzle-orm
export const client = postgres(connectionString, {
  max: 10,  // Set max pool connections
  idle_timeout: 20, // Timeout idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout after 10 seconds
});
export const db = drizzle(client);

// Log database connection
console.log(`[INFO] ${new Date().toISOString()}: Database connection established`);