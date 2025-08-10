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

Context: ${scenarioContext}

Rules:
- Stay in character and consider the scenario context carefully
- If the care worker suggests contacting someone who has passed away (as mentioned in context), respond with confusion or sadness about this
- React to their tone and approach
- Be empathetic if they are, anxious if they're dismissive
- Keep responses short (1 sentence)
- JSON format: { "message": "response", "sentiment": "positive/neutral/negative/distressed/confused", "shouldContinue": true }

Last exchange:
${conversationHistory.slice(-2).map(h => `${h.role === 'user' ? 'Worker' : 'Patient'}: ${h.message}`).join('\n')}`;

    console.log('🤖 Making OpenAI API call...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: conversationHistory.length === 0 ? 
          "Start the conversation as the patient. Introduce your concern or situation." : 
          "Respond to what the care worker just said considering the scenario context." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 80,
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
   - Offers practical, person-centred solutions appropriate to scenario context
   - Considers patient's individual needs and preferences  
   - Demonstrates critical thinking about care options
   - IMPORTANT: Avoids suggestions that contradict scenario facts (e.g., contacting deceased family members)

Provide detailed feedback in JSON format with concise text to avoid parsing errors:
{
  "empathy": 1-5,
  "communication": 1-5,
  "professionalism": 1-5,
  "problemSolving": 1-5,
  "summary": "Brief constructive feedback with specific examples",
  "strengths": ["specific strength", "another strength"],
  "improvements": ["specific improvement needed", "another improvement"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide feedback analysis." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse feedback JSON');
    }
    
    return {
      empathy: result.empathy || 3,
      communication: result.communication || 3,
      professionalism: result.professionalism || 3,
      problemSolving: result.problemSolving || 3,
      summary: result.summary || "Your response shows professional engagement. Focus on acknowledging emotions and considering scenario context before offering solutions.",
      strengths: result.strengths || ["Maintained professional tone", "Engaged with the situation"],
      improvements: result.improvements || ["Consider scenario context more carefully", "Validate emotions before problem-solving"]
    };
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    // Return default feedback
    return {
      empathy: 3,
      communication: 3,
      professionalism: 3,
      problemSolving: 3,
      summary: "Your response shows professional engagement. Focus on acknowledging emotions and considering scenario context before offering solutions.",
      strengths: ["Maintained professional tone", "Engaged with the situation"],
      improvements: ["Consider scenario context more carefully", "Validate emotions before problem-solving"]
    };
  }
}
