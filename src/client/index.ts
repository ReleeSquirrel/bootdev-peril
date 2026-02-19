import amqp from "amqplib";
import { clientWelcome, commandStatus, getInput, printClientHelp, printQuit } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind, SimpleQueueType } from "../internal/pubsub/declareAndBind.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import { GameState } from "../internal/gamelogic/gamestate.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { commandMove } from "../internal/gamelogic/move.js";

async function main() {
  // Start the Peril client and connect to the RabbitMQ server
  console.log("Starting Peril client...");
  const connectionString = `amqp://guest:guest@localhost:5672/`;
  const connection = await amqp.connect(connectionString);
  const confirmChannel = await connection.createConfirmChannel();
  console.log(`Connection was successful!`);

  // Welcome the user
  const userName = await clientWelcome();

  const declareAndBindResult = await declareAndBind(
    connection,
    ExchangePerilDirect,
    `${PauseKey}.${userName}`,
    PauseKey,
    SimpleQueueType.Transient);

  const gameState: GameState = new GameState(userName);

  // Interact with the user
  while (true) {
    const input = await getInput();
    if (input.length === 0) continue;

    // Check the first word
    switch (input[0]) {
      case `spawn`:
        commandSpawn(gameState, input);
        continue;
      case `move`:
        commandMove(gameState, input);
        continue;
      case `status`:
        commandStatus(gameState);
        continue;
      case `help`:
        printClientHelp();
        continue;
      case `spam`:
        console.log(`Spamming not allowed yet!`);
        continue;
      case `quit`:
        printQuit();
        process.exit();
      default:
        console.log(`I didn't understand that command.`);
        printClientHelp();
        continue;
    }

    break;
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
