import type { ConfirmChannel } from "amqplib";


export async function publishJSON<T>(
    ch: ConfirmChannel,
    exchange: string,
    routingKey: string,
    value: T,
): Promise<void> {

    const serializedValue = await JSON.stringify(value);
    const serializedValueBytes = Buffer.from(serializedValue, "utf8");
    ch.publish(exchange, routingKey, serializedValueBytes, { contentType: "application/json" });

    return;
};