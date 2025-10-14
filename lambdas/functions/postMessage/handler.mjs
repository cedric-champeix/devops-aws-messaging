import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "dynamodb-all-messages";
const channelId = "maverick";

export const handler = async (event) => {
  try {
    const body = event;

    // Validate required fields
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

    return {
      statusCode: 201,
      body: { channel_id: channelId, timestamp_utc_iso8601: timestamp },
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message || err }) };
  }
};
