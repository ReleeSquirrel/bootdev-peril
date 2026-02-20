import amqp from "amqplib";
import { declareAndBind, type SimpleQueueType } from "./declareAndBind.js";

export async function subscribeJSON<T>(
  conn: amqp.ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType, // an enum to represent "durable" or "transient"
  handler: (data: T) => void,
): Promise<void> {
    const queue = await declareAndBind(conn, exchange, queueName, key, queueType);
    queue[0].consume(queue[1].queue, (message: amqp.ConsumeMessage | null) => {
        if (message === null) return;
        const messageContent = JSON.parse(message.content.toString());
        handler(messageContent);
        queue[0].ack(message);
    })
};