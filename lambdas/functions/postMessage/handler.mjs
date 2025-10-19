import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const client = new DynamoDBClient({ region: "eu-west-1" });
const dynamo = DynamoDBDocumentClient.from(client);
const ebClient = new EventBridgeClient({ region: "eu-west-1" });

const tableName = "dynamodb-all-messages";
const channelId = "maverick";

export const handler = async (event) => {
  try {
    const body = event;

    if (!body.content || !body.userName || !body.userId) {
      return { statusCode: 400, body: "Missing content, userName or userId" };
    }

    const timestamp = new Date().toISOString();

    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          channel_id: channelId,
          timestamp_utc_iso8601: timestamp,
          content: body.content,
          userName: body.userName,
          userId: body.userId,
        },
      })
    );

    await notifyNewMessage({ channelId, content: body.content });

    return {
      statusCode: 201,
      body: { channel_id: channelId, timestamp_utc_iso8601: timestamp },
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message || err }) };
  }
};

async function notifyNewMessage({ channelId, content }) {
  await ebClient.send(
    new PutEventsCommand({
      Entries: [
        {
          Source: "messaging_app.maverick.messages",
          DetailType: "NewMessage",
          Detail: JSON.stringify({ channelId, content }),
          EventBusName: "default",
        },
      ],
    })
  );
}
