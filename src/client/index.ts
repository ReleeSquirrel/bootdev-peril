import amqp from "amqplib";
import { clientWelcome } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind, SimpleQueueType } from "../internal/pubsub/declareAndBind.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";

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
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
