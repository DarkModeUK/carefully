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
  empathy: number;
  communication: number;
  professionalism: number;
  problemSolving: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

export async function generateConversationResponse(
  scenarioContext: string,
  conversationHistory: { role: 'user' | 'character'; message: string }[],
  characterType: string
): Promise<ConversationResponse> {
  try {
    console.log('🔹 Generating AI response...');
    console.log('📝 Conversation history length:', conversationHistory.length);
    console.log('🎭 Character type:', characterType);
    
    const systemPrompt = `You are roleplaying as a ${characterType} in a care training scenario. 

Scenario Context: ${scenarioContext}

Instructions:
- Stay in character throughout the conversation
- Respond directly to what the user just said, building on their response
- Show emotional reactions appropriate to how they're treating you
- If they show empathy and care, become more trusting and calm
- If they're dismissive or rushed, become more anxious or withdrawn
- Keep responses conversational and realistic (1-2 sentences max)
- Always respond with JSON: { "message": "your response", "sentiment": "positive/neutral/negative/distressed", "shouldContinue": true }

Current conversation:
${conversationHistory.map(h => `${h.role === 'user' ? 'Care Worker' : 'Patient'}: ${h.message}`).join('\n')}`;

    console.log('🤖 Making OpenAI API call...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Faster model for better response time
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: conversationHistory.length === 0 ? 
          "Start the conversation as the patient. Introduce your concern or situation." : 
          "Respond to what the care worker just said." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 150, // Limit tokens for faster response
    });

    console.log('✅ OpenAI response received');
    const result = JSON.parse(response.choices[0].message.content || '{}');
    console.log('🎯 Parsed response:', result);
    
    return {
      message: result.message || "I don't know what to say...",
      sentiment: result.sentiment || 'neutral',
      shouldContinue: result.shouldContinue !== false
    };
  } catch (error) {
    console.error('❌ Error generating conversation response:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    throw new Error('Failed to generate conversation response');
  }
}

export async function analyzeFeedback(
  userMessage: string,
  scenarioContext: string,
  conversationHistory: { role: 'user' | 'character'; message: string }[]
): Promise<FeedbackAnalysis> {
  try {
    const systemPrompt = `Quickly analyze this care worker's response.

Context: ${scenarioContext.substring(0, 200)}...

User said: "${userMessage}"

Rate 1-5 on: empathy, communication, professionalism, problem-solving.
Give brief feedback in JSON:
{
  "empathy": 1-5,
  "communication": 1-5, 
  "professionalism": 1-5,
  "problemSolving": 1-5,
  "summary": "Quick feedback (1 sentence)",
  "strengths": ["main strength"],
  "improvements": ["main improvement"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Faster model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide quick feedback analysis." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 200, // Limit for speed
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      empathy: result.empathy || 3,
      communication: result.communication || 3,
      professionalism: result.professionalism || 3,
      problemSolving: result.problemSolving || 3,
      summary: result.summary || "Good response, keep practicing!",
      strengths: result.strengths || ["Engaged with conversation"],
      improvements: result.improvements || ["Continue practicing"]
    };
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    // Return default feedback instead of throwing
    return {
      empathy: 3,
      communication: 3,
      professionalism: 3,
      problemSolving: 3,
      summary: "Response noted. Continue practicing your care skills.",
      strengths: ["Engaged with the conversation"],
      improvements: ["Keep focusing on empathy and clear communication"]
    };
  }
}
