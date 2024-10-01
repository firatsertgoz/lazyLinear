import dotenv from 'dotenv';

dotenv.config();

export default {
  claudeApiKey: process.env.CLAUDE_API_KEY as string,
  linearApiKey: process.env.LINEAR_API_KEY as string
};