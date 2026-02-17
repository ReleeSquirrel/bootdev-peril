import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/publishJSON.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";

async function main() {
  // Start the Peril server and connect to the RabbitMQ server
  console.log("Starting Peril server...");
  const connectionString = `amqp://guest:guest@localhost:5672/`;
  const connection = await amqp.connect(connectionString);
  const confirmChannel = await connection.createConfirmChannel();
  console.log(`Connection was successful!`);

  // Publish a message to the exchange
  publishJSON(confirmChannel, ExchangePerilDirect, PauseKey, { isPaused: true } satisfies PlayingState);

  // Handle SIGINT events for exit signal
  process.on('SIGINT', () => {
    console.log(`Program is shutting down.`);
    connection.close();
    process.exit(0);
  });

  // Keep the process alive until exit by listening to stdin
  process.stdin.resume();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
