import amqp, { type Channel } from "amqplib";

export enum SimpleQueueType {
  Durable,
  Transient,
}

export async function declareAndBind(
  conn: amqp.ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType,
): Promise<[Channel, amqp.Replies.AssertQueue]> {
    const channel = await conn.createChannel();
    const queue = await channel.assertQueue(queueName, {
        exclusive: queueType === SimpleQueueType.Transient ? true : false,
        durable: queueType === SimpleQueueType.Durable ? true : false,
        autoDelete: queueType === SimpleQueueType.Transient ? true : false
    });
    channel.bindQueue(queueName, exchange, key);
    return [channel, queue];
};