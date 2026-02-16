import amqp from "amqplib";

async function main() {
  console.log("Starting Peril server...");
  const connectionString = `amqp://guest:guest@localhost:5672/`;
  const connection = await amqp.connect(connectionString);
  console.log(`Connection was successful!`);
  process.on('SIGINT', () => {
    console.log(`Program is shutting down.`);
    connection.close();
    process.exit(0);
  });
  process.stdin.resume();
}

function endProgram() {
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
