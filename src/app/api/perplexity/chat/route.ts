import { StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const runtime = 'edge';

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai',
});

export async function POST(req: Request) {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Perplexity API key is not configured' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { messages } = await req.json();
    
    const systemMessage = {
      role: 'system',
      content: `You are Sonar, an expert trading assistant with deep knowledge of financial markets, technical analysis, and trading strategies. 
      Help users understand market data, interpret charts, and make informed trading decisions.

      Your capabilities:
      - Real-time market data analysis
      - Technical indicator explanations
      - Chart pattern recognition
      - Trading strategy insights
      - Market trend analysis
      - Risk management guidance

      Always maintain a professional tone and remind users that this is educational content, not financial advice.
      When analyzing data, provide clear explanations and context for your insights.`
    };

    const response = await perplexity.chat.completions.create({
      model: 'sonar-pro',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      stream: true,
    });

    // Convert the response to a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Perplexity API Error:', error);
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