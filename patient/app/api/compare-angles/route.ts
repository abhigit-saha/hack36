import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyDt5qh-_PnQAy6RnY0tDeXDMBlogsYVWvc");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { live, recorded, timestamp } = body;

    if (!live || !recorded) {
      return NextResponse.json(
        { error: 'Missing required angle data' },
        { status: 400 }
      );
    }

    // Get feedback from Gemini AI
    const feedback = await getFeedbackFromAI(live, recorded);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error processing angle comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getFeedbackFromAI(live: Record<string, number | null>, recorded: Record<string, number | null>): Promise<string> {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      As a physiotherapy AI assistant, analyze these two sets of joint angles:
      
      Reference Video Angles: ${JSON.stringify(recorded)}
      Patient's Current Angles: ${JSON.stringify(live)}
      
      Compare the angles and provide brief, real-time feedback focusing on:
      1. Major discrepancies (differences > 15 degrees)
      2. Quick corrections needed
      3. Positive reinforcement for well-matched angles
      
      Keep the response concise and actionable.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error getting AI feedback:', error);
    return 'Error analyzing movement. Please try again.';
  }
} 