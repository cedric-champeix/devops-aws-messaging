import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "dynamodb-all-messages";
const channelId = "maverick";

export const handler = async (event) => {
  try {
    const { channel_id, timestamp_utc_iso8601 } = event.queryStringParameters ?? {};

    const data = await dynamo.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "channel_id = :channel_id",
        ExpressionAttributeValues: {
          ":channel_id": channelId,
        },
        ScanIndexForward: false,
        Limit: 10,
        ExclusiveStartKey: channel_id && timestamp_utc_iso8601 ? { channel_id, timestamp_utc_iso8601 } : undefined,
      })
    );

    return {
      statusCode: 200,
      body: { messages: data.Items, lastEvaluatedKey: data.LastEvaluatedKey },
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message || err }) };
  }
};
