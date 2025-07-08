import { configDotenv } from "dotenv";
import { StreamChat } from "stream-chat";
configDotenv();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// Get a company-scoped Stream client (for multi-tenant isolation)
export const getCompanyStreamClient = (companyId) => {
  if (!companyId) throw new Error("companyId is required");
  return streamClient;
};

// Upsert a Stream user with companyId in their profile
export const upsertStreamUser = async (userId, userData, companyId) => {
  if (!companyId) throw new Error("companyId is required");
  try {
    await streamClient.upsertUser({ id: userId, companyId, ...userData });
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

// Create a company-scoped channel
export const createCompanyChannel = async (
  type,
  channelId,
  companyId,
  members = [],
  extraData = {}
) => {
  if (!companyId) throw new Error("companyId is required");
  try {
    const channel = streamClient.channel(type, channelId, {
      ...extraData,
      companyId,
      members,
    });
    await channel.create();
    return channel;
  } catch (error) {
    console.error("Error creating company channel:", error);
    throw error;
  }
};

// Generate a Stream token
export const generateStreamToken = (userId) => {
  try {
    if (!userId) throw new Error("User ID is required");
    return streamClient.createToken(userId.toString());
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};
