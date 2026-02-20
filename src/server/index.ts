import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/publishJSON.js";
import { ExchangePerilDirect, ExchangePerilTopic, GameLogSlug, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
import { getInput, printServerHelp } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind, SimpleQueueType } from "../internal/pubsub/declareAndBind.js";

async function main() {
  // Start the Peril server and connect to the RabbitMQ server
  console.log("Starting Peril server...");
  const connectionString = `amqp://guest:guest@localhost:5672/`;
  const connection = await amqp.connect(connectionString);
  const confirmChannel = await connection.createConfirmChannel();
  console.log(`Connection was successful!`);

  const gameLogsQueue = declareAndBind(connection, ExchangePerilTopic, GameLogSlug, `${GameLogSlug}.*`, SimpleQueueType.Durable);
  

  function exitProgram() {
    console.log(`Program is shutting down.`);
    connection.close();
    process.exit(0);
  }

  // Handle SIGINT events for exit signal
  process.on('SIGINT', () => {
    exitProgram();
  });

  // Interact with the user
  printServerHelp();

  while (true) {
    const input = await getInput();
    if (input.length === 0) continue;

    // Check the first word
    switch (input[0]) {
      case `pause`:
        console.log(`Sending a pause message.`);
        // Publish a message to the exchange
        publishJSON(confirmChannel, ExchangePerilDirect, PauseKey, { isPaused: true } satisfies PlayingState);
        continue;
      case `resume`:
        console.log(`Sending a resume message.`);
        // Publish a message to the exchange
        publishJSON(confirmChannel, ExchangePerilDirect, PauseKey, { isPaused: false } satisfies PlayingState);
        continue;
      case `quit`:
        console.log(`Exiting the program.`);
        exitProgram();
      default:
        console.log(`I don't understand the command.`);
        printServerHelp();
        continue;
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});