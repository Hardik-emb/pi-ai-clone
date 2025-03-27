import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Log the received messages and API key (first few chars only for security)
    const apiKey = process.env.ANTHROPIC_API_KEY || "";
    console.log("API Key (first 4 chars):", apiKey.substring(0, 4));
    console.log("Received messages:", JSON.stringify(messages));

    // Extract system message if present
    const systemMessage = messages.find((m: any) => m.role === 'system');
    
    // Filter out messages with empty content and system messages
    const userAssistantMessages = messages.filter((m: any) => 
      m.role !== 'system' && (m.role === 'assistant' || m.content.trim() !== '')
    );

    // Format messages for Anthropic API
    const formattedMessages = userAssistantMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Log the formatted messages being sent to the API
    console.log("Sending to Anthropic API:", JSON.stringify(formattedMessages));

    // Create a direct request to Anthropic's API with streaming enabled
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        messages: formattedMessages,
        system: systemMessage?.content,
        max_tokens: 4000,
        stream: true,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", JSON.stringify(errorData));
      return NextResponse.json({ error: `Anthropic API error: ${JSON.stringify(errorData)}` }, { status: response.status });
    }

    // Create a transform stream to convert Anthropic's streaming format to the format expected by the client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Buffer to accumulate partial JSON data
    let buffer = '';
    
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        console.log("Raw chunk:", text);
        
        // Append to buffer
        buffer += text;
        
        // Split by newlines
        const lines = buffer.split('\n');
        
        // Process all complete lines
        buffer = lines.pop() || ''; // Keep the last (potentially incomplete) line in the buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const json = JSON.parse(data);
              console.log("Parsed JSON:", json);
              
              if (json.type === 'content_block_delta' && json.delta.type === 'text_delta') {
                const text = json.delta.text || '';
                if (text) {
                  // Log the text being sent to the client
                  console.log("Sending text to client:", text);
                  controller.enqueue(encoder.encode(text));
                }
              }
            } catch (e) {
              console.error('Error parsing JSON:', e, 'Line:', line);
            }
          }
        }
      },
      
      // Process any remaining data in the buffer when the stream ends
      flush(controller) {
        if (buffer.trim() !== '') {
          if (buffer.startsWith('data: ')) {
            const data = buffer.slice(6);
            if (data !== '[DONE]') {
              try {
                const json = JSON.parse(data);
                if (json.type === 'content_block_delta' && json.delta.type === 'text_delta') {
                  const text = json.delta.text || '';
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                }
              } catch (e) {
                console.error('Error parsing JSON in flush:', e, 'Buffer:', buffer);
              }
            }
          }
        }
      }
    });

    // Pipe the response through the transform stream
    const responseStream = response.body?.pipeThrough(transformStream);
    
    if (!responseStream) {
      throw new Error('Failed to create response stream');
    }

    // Return a streaming response
    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: `Something went wrong: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
