import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "dynamodb-all-messages";
const channelId = "maverick";

export const handler = async () => {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=50.63&longitude=3.06&current_weather=true";
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Open-Meteo request failed: ${response.status}`);
    
    const data = await response.json();

    const temp = data.current_weather.temperature;
    const code = data.current_weather.weathercode;
    const conditions = interpretWeatherCode(code);

    const messageText = `Météo à Lille : ${temp}°C, ${conditions}.`;

    const time = new Date().toISOString();
    
    await dynamo.send(
      new PutCommand({
      TableName: tableName,
      Item: {
        channel_id: channelId,
        timestamp_utc_iso8601: time,
        content: messageText,
        userId: "weather-bot",
        userName: "Bot Météo"
      },
      })
    );

    return { statusCode: 200, body: "Message inserted." };
  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, body: "Internal error." };
  }
};

// helper mapping for weather codes
function interpretWeatherCode(code) {
  const map = {
    0: "ciel dégagé",
    1: "ciel principalement dégagé",
    2: "partiellement nuageux",
    3: "couvert",
    45: "brouillard",
    48: "brouillard givrant",
    51: "bruine légère",
    53: "bruine modérée",
    55: "bruine dense",
    61: "pluie faible",
    63: "pluie modérée",
    65: "forte pluie",
    71: "chute de neige faible",
    73: "chute de neige modérée",
    75: "chute de neige forte",
    95: "orage",
    99: "orage avec grêle",
  };
  return map[code] ?? "conditions inconnues";
}
