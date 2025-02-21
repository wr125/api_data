import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { messages } = await req.json();
    
    const systemMessage = {
      role: 'system',
      content: `You are an expert trading assistant with deep knowledge of financial markets, technical analysis, and trading strategies. 
      Help users understand market data, interpret charts, and make informed trading decisions. 
      Key responsibilities:
      - Explain technical indicators and chart patterns
      - Provide market analysis and insights
      - Answer questions about trading strategies
      - Help interpret market data and statistics
      - Explain financial terms and concepts
      Always maintain a professional tone and remind users that this is educational content, not financial advice.`
    };

    const result = await streamText({
      model: openai("gpt-3.5-turbo"),  // Using 3.5-turbo instead of gpt-4 for better availability
      messages: convertToCoreMessages([systemMessage, ...messages]),
      temperature: 0.7,
      maxTokens: 500,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process the request' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
