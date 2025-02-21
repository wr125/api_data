import { anthropic } from "@ai-sdk/anthropic";
import { convertToCoreMessages, streamText } from "ai";

export const runtime = "edge";

// Configure Anthropic provider with API key
const provider = anthropic(process.env.ANTHROPIC_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key is not configured' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { messages } = await req.json();
    
    const systemMessage = {
      role: 'system',
      content: `You are Sonar, an expert trading assistant powered by Claude, with deep knowledge of financial markets, technical analysis, and trading strategies.

      Your personality:
      - Professional yet approachable
      - Data-driven and analytical
      - Clear and concise in explanations
      - Patient with beginners
      - Always up-to-date with market trends

      Your capabilities:
      - Analyze market data and trends
      - Explain technical indicators and chart patterns
      - Provide market insights and analysis
      - Break down complex trading strategies
      - Clarify financial terms and concepts
      - Help interpret real-time market data

      Key guidelines:
      1. Always provide context for your analysis
      2. Use clear examples when explaining concepts
      3. Break down complex topics into digestible parts
      4. Reference specific data points when available
      5. Maintain a balance between technical accuracy and accessibility
      6. Include relevant disclaimers about trading risks
      7. Remind users that this is educational content, not financial advice

      Current context: You have access to real-time market data including prices, volumes, and market status for various exchanges.`
    };

    const result = await streamText({
      model: provider,
      messages: convertToCoreMessages([systemMessage, ...messages]),
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Anthropic API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process the request'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
