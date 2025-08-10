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
    const conversationContextText = conversationHistory.slice(-4).map(msg => 
      `${msg.role === 'user' ? 'Care Worker' : 'Patient'}: ${msg.message}`
    ).join('\n');

    const systemPrompt = `As an expert care training assessor, provide detailed, constructive feedback on this care worker's response.

SCENARIO CONTEXT:
${scenarioContext}

RECENT CONVERSATION:
${conversationContextText}

CURRENT RESPONSE TO EVALUATE:
Care Worker: "${userMessage}"

ASSESSMENT CRITERIA:
Evaluate the response across these key care competencies:

1. EMPATHY & EMOTIONAL INTELLIGENCE (1-5)
   - Acknowledges patient's feelings and concerns
   - Uses validating language
   - Shows genuine understanding

2. COMMUNICATION SKILLS (1-5)
   - Clear, respectful, age-appropriate language
   - Active listening demonstrated
   - Avoids jargon or condescending tone

3. PROFESSIONALISM (1-5)
   - Maintains appropriate boundaries
   - Follows care protocols
   - Demonstrates dignity and respect

4. PROBLEM-SOLVING APPROACH (1-5)
   - Offers practical solutions
   - Uses person-centred approach
   - Considers multiple options

Provide detailed feedback in JSON format:
{
  "empathy": 1-5,
  "communication": 1-5,
  "professionalism": 1-5,
  "problemSolving": 1-5,
  "summary": "Detailed constructive feedback (2-3 sentences) highlighting specific strengths and areas for improvement with examples",
  "strengths": ["specific strength with context", "another specific strength"],
  "improvements": ["specific improvement with actionable suggestion", "another improvement area"],
  "quickSummary": "One key actionable takeaway for immediate improvement"
}

Focus on being specific, constructive, and encouraging. Reference their actual words where possible.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide detailed feedback analysis." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 500,
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
