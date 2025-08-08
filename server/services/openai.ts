import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ConversationResponse {
  message: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'distressed';
  shouldContinue: boolean;
}

export interface FeedbackAnalysis {
  empathyScore: number;
  toneScore: number;
  clarityScore: number;
  decisionMakingScore: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
}

export async function generateConversationResponse(
  scenarioContext: string,
  conversationHistory: { role: 'user' | 'character'; message: string }[],
  characterType: string
): Promise<ConversationResponse> {
  try {
    const systemPrompt = `You are roleplaying as a ${characterType} in a care training scenario. 

Scenario Context: ${scenarioContext}

Instructions:
- Stay in character throughout the conversation
- Respond naturally and emotionally appropriate to the scenario
- If the user's response shows good empathy and care skills, gradually become more calm/receptive
- If the user's response is inappropriate or insensitive, become more distressed or defensive
- Keep responses realistic and not too long (1-3 sentences)
- Respond with JSON in this format: { "message": "your response", "sentiment": "positive/neutral/negative/distressed", "shouldContinue": true/false }

Conversation history:
${conversationHistory.map(h => `${h.role}: ${h.message}`).join('\n')}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the next response in this conversation." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      message: result.message || "I don't know what to say...",
      sentiment: result.sentiment || 'neutral',
      shouldContinue: result.shouldContinue !== false
    };
  } catch (error) {
    console.error('Error generating conversation response:', error);
    throw new Error('Failed to generate conversation response');
  }
}

export async function analyzeFeedback(
  userResponse: string,
  scenarioContext: string,
  conversationHistory: { role: 'user' | 'character'; message: string }[]
): Promise<FeedbackAnalysis> {
  try {
    const systemPrompt = `You are an expert care training assessor. Analyze the user's response for empathy, tone, clarity, and decision-making in this care scenario.

Scenario Context: ${scenarioContext}

Conversation History:
${conversationHistory.map(h => `${h.role}: ${h.message}`).join('\n')}

User's Response to Analyze: "${userResponse}"

Rate each aspect from 0-100 and provide constructive feedback. Respond with JSON in this format:
{
  "empathyScore": number,
  "toneScore": number, 
  "clarityScore": number,
  "decisionMakingScore": number,
  "overallScore": number,
  "feedback": "overall assessment",
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze this response and provide detailed feedback." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      empathyScore: Math.max(0, Math.min(100, result.empathyScore || 50)),
      toneScore: Math.max(0, Math.min(100, result.toneScore || 50)),
      clarityScore: Math.max(0, Math.min(100, result.clarityScore || 50)),
      decisionMakingScore: Math.max(0, Math.min(100, result.decisionMakingScore || 50)),
      overallScore: Math.max(0, Math.min(100, result.overallScore || 50)),
      feedback: result.feedback || "Keep practicing to improve your care skills.",
      suggestions: result.suggestions || ["Continue practicing empathetic responses"]
    };
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    throw new Error('Failed to analyze feedback');
  }
}
