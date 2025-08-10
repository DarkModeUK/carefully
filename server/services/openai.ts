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
    
    const systemPrompt = `You are a ${characterType} in a care scenario. 

Context: ${scenarioContext.substring(0, 200)}...

Rules:
- Stay in character
- React to their tone and approach
- Be empathetic if they are, anxious if they're dismissive
- Keep responses short (1 sentence)
- JSON format: { "message": "response", "sentiment": "positive/neutral/negative/distressed", "shouldContinue": true }

Last exchange:
${conversationHistory.slice(-2).map(h => `${h.role === 'user' ? 'Worker' : 'Patient'}: ${h.message}`).join('\n')}`;

    console.log('🤖 Making OpenAI API call...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fastest model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: conversationHistory.length === 0 ? 
          "Start the conversation as the patient. Introduce your concern or situation." : 
          "Respond to what the care worker just said." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 60, // Very short for speed
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
      name: (error as any)?.name,
      message: (error as any)?.message,
      stack: (error as any)?.stack?.split('\n')[0]
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
    const recentChat = conversationHistory.slice(-2).map(msg => 
      `${msg.role === 'user' ? 'Worker' : 'Patient'}: ${msg.message}`
    ).join('\n');

    const systemPrompt = `Assess this care worker response quickly:

Context: ${scenarioContext.substring(0, 150)}...
Recent chat: ${recentChat}
Response: "${userMessage}"

Rate 1-5: empathy, communication, professionalism, problemSolving
Give brief feedback in JSON:
{
  "empathy": 1-5,
  "communication": 1-5,
  "professionalism": 1-5,
  "problemSolving": 1-5,
  "summary": "Brief constructive feedback (1-2 sentences)",
  "strengths": ["main strength"],
  "improvements": ["key improvement"],
  "quickSummary": "One actionable tip"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use faster model for feedback too
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide feedback analysis." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower for consistency and speed
      max_tokens: 250, // Reduced for faster generation
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      empathy: result.empathy || 3,
      communication: result.communication || 3,
      professionalism: result.professionalism || 3,
      problemSolving: result.problemSolving || 3,
      summary: result.summary || "Your response shows professional awareness. Consider acknowledging the person's emotional state more explicitly and exploring their specific concerns before offering solutions.",
      strengths: result.strengths || ["Maintained professional approach", "Engaged with the situation"],
      improvements: result.improvements || ["Show more emotional validation", "Ask open-ended questions to understand their perspective"],
      quickSummary: result.quickSummary || "Start by acknowledging their feelings before moving to problem-solving"
    };
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    // Return improved default feedback
    return {
      empathy: 3,
      communication: 3,
      professionalism: 3,
      problemSolving: 3,
      summary: "Your response demonstrates professional engagement. To enhance your approach, focus on acknowledging the person's emotional state more explicitly and explore their specific concerns through open-ended questions before offering solutions.",
      strengths: ["Professional tone maintained", "Engaged with the conversation appropriately"],
      improvements: ["Validate feelings with phrases like 'I can see this is concerning for you'", "Ask questions to understand their perspective better"],
      quickSummary: "Lead with empathy by acknowledging their emotional experience first"
    };
  }
}
