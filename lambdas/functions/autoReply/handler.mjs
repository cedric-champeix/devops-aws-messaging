import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "dynamodb-all-messages";
const userName = "Auto Reply Bot";
const userId = "auto-reply-bot";

const { TMDB_API_KEY } = process.env;
const TMDB_URL = `https://api.themoviedb.org/3/movie/now_playing?language=fr-FR&region=FR&page=1`;

export const handler = async (event) => {
  try {
    const body = event.detail || {};

    if (!body.content || !body.channelId) {
      console.warn("Missing content or channelId", body);
      return;
    }

    const { content, channelId } = body;

    let moviesList = null;

    if (!content.includes("/movies")) return;

    const response = await fetch(TMDB_URL, { 
      method: "GET", 
      headers: { 
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`,
        "Accept-Encoding": "gzip"
      } 
    });

    if (!response.ok)
      throw new Error(`TMDB API error: ${response.statusText}`);
    
    const data = await response.json();

    let message;

    if (data && data.results && Array.isArray(data.results)) {
      moviesList = data.results.map((movie) => `• ${movie.title}`).join("\n");
      message = `Derniers films en salle :\n${moviesList}`;
    } else {
      message = "Aucun film trouvé.";
    }
  
    const timestamp = new Date().toISOString();

    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          channel_id: channelId,
          timestamp_utc_iso8601: timestamp,
          content: message,
          userName: userName,
          userId: userId,
        },
      })
    );
  } catch (err) {
    console.error("Auto-reply error:", err);
  }
};
