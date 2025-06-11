
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in Replit Secrets
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "user",
      content: "Write a one-sentence bedtime story about a unicorn."
    }
  ],
  max_tokens: 100
});

console.log(response.choices[0].message.content);
