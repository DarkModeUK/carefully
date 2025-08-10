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

    const systemPrompt = `As an expert care training assessor, provide detailed analysis of this care worker's response.

SCENARIO CONTEXT: ${scenarioContext}

CONVERSATION HISTORY:
${recentChat}

RESPONSE TO EVALUATE: "${userMessage}"

Assess using evidence-based care standards across these competencies:

1. EMPATHY & EMOTIONAL INTELLIGENCE (1-5)
   - Validates patient's feelings and demonstrates understanding
   - Uses person-centred language that acknowledges dignity
   - Shows genuine care and emotional attunement

2. COMMUNICATION SKILLS (1-5)
   - Clear, respectful, age-appropriate language
   - Active listening demonstrated through responses
   - Avoids medical jargon, uses accessible explanations

3. PROFESSIONALISM (1-5)
   - Maintains appropriate boundaries and ethics
   - Follows care protocols and best practices
   - Demonstrates respect for patient autonomy

4. PROBLEM-SOLVING APPROACH (1-5)
   - Offers practical, person-centred solutions
   - Considers patient's individual needs and preferences
   - Demonstrates critical thinking about care options

Provide detailed feedback in JSON format:
{
  "empathy": 1-5,
  "communication": 1-5,
  "professionalism": 1-5,
  "problemSolving": 1-5,
  "summary": "Detailed constructive feedback highlighting specific examples from their response",
  "strengths": ["specific strength with evidence", "another strength with context"],
  "improvements": ["specific improvement with actionable suggestion", "another improvement with clear guidance"],
  "quickSummary": "One key actionable takeaway for immediate improvement",
  "keyInsights": ["Important insight about care approach", "Learning opportunity identified"],
  "nextSteps": ["Specific action to practise", "Skill to develop further"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use faster model for feedback too
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide feedback analysis." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower for consistency and speed
      max_tokens: 400, // Increased for detailed feedback
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      empathy: result.empathy || 3,
      communication: result.communication || 3,
      professionalism: result.professionalism || 3,
      problemSolving: result.problemSolving || 3,
      summary: result.summary || "Your response demonstrates professional awareness and engagement. To enhance your care approach, focus on acknowledging the person's emotional state more explicitly and explore their specific concerns through thoughtful questioning before moving to solutions.",
      strengths: result.strengths || ["Maintained professional boundaries and appropriate tone", "Engaged meaningfully with the conversation"],
      improvements: result.improvements || ["Validate emotions with specific phrases like 'I can understand this must be difficult for you'", "Use open-ended questions to gather more information about their unique perspective and needs"],
      quickSummary: result.quickSummary || "Lead with empathy by acknowledging their emotional experience before problem-solving",
      keyInsights: result.keyInsights || ["Person-centred care requires balancing emotional support with practical assistance", "Active listening involves both hearing words and understanding underlying feelings"],
      nextSteps: result.nextSteps || ["Practice reflecting feelings back to show understanding", "Develop skills in asking questions that encourage sharing"]
    };
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    // Return enhanced default feedback
    return {
      empathy: 3,
      communication: 3,
      professionalism: 3,
      problemSolving: 3,
      summary: "Your response demonstrates professional engagement and care awareness. To strengthen your approach, focus on explicitly acknowledging the person's emotional state and use thoughtful questioning to understand their unique perspective before moving to practical solutions.",
      strengths: ["Maintained professional boundaries and respectful tone", "Demonstrated engagement with the care situation"],
      improvements: ["Use empathetic validation phrases such as 'I can understand this must be challenging for you'", "Ask open-ended questions that invite the person to share more about their specific needs and feelings"],
      quickSummary: "Begin conversations by acknowledging emotions before moving to problem-solving",
      keyInsights: ["Effective care communication balances emotional support with practical problem-solving", "Understanding the person's perspective is essential before offering solutions"],
      nextSteps: ["Practice using reflective listening techniques to validate feelings", "Develop a repertoire of open-ended questions that encourage deeper sharing"]
    };
  }
}
