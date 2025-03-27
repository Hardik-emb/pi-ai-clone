import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if the ANTHROPIC_API_KEY is set
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    return NextResponse.json({
      anthropicApiKey: apiKey ? "Set (first 4 chars: " + apiKey.substring(0, 4) + "...)" : "Not set",
    });
  } catch (error) {
    console.error("Error checking environment:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
