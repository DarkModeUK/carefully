import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Learning enhancement utilities for improved chat experience

export interface LearningHint {
  type: 'empathy' | 'communication' | 'problem-solving' | 'professional' | 'active-listening';
  message: string;
  timing: 'immediate' | 'after-response' | 'mid-conversation';
  priority: 'low' | 'medium' | 'high';
}

export interface ConversationAnalysis {
  toneShift: 'improving' | 'declining' | 'stable';
  engagementLevel: number; // 1-10
  missedOpportunities: string[];
  strongMoments: string[];
  suggestedDirection: string;
  emotionalState: 'distressed' | 'calm' | 'agitated' | 'confused' | 'responsive';
}

export interface AlternativeResponse {
  category: 'empathetic' | 'professional' | 'problem-solving';
  text: string;
  explanation: string;
  skillFocus: string;
}

// Generate real-time learning hints based on conversation context
export async function generateLearningHints(
  userResponse: string,
  scenarioContext: string,
  conversationHistory: { role: 'user' | 'character'; message: string }[],
  patientSentiment: string
): Promise<LearningHint[]> {
  try {
    const systemPrompt = `You are a care training coach providing real-time learning hints.

SCENARIO: ${scenarioContext.substring(0, 300)}...
PATIENT CURRENT STATE: ${patientSentiment}
USER'S RESPONSE: "${userResponse}"

Recent conversation:
${conversationHistory.slice(-3).map(h => `${h.role}: ${h.message}`).join('\n')}

Identify immediate learning opportunities and provide 1-2 specific, actionable hints that could help the care worker improve their approach right now.

Focus on:
- Missing empathy opportunities
- Better communication techniques  
- Professional boundary issues
- Active listening improvements
- Problem-solving approach

Return JSON:
{
  "hints": [
    {
      "type": "empathy|communication|problem-solving|professional|active-listening",
      "message": "Specific actionable hint (max 25 words)",
      "timing": "immediate|after-response",
      "priority": "low|medium|high"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide learning hints." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.hints || [];
  } catch (error) {
    console.error('Error generating learning hints:', error);
    return [];
  }
}

// Analyze conversation flow and provide strategic guidance
export async function analyzeConversationFlow(
  conversationHistory: { role: 'user' | 'character'; message: string }[],
  scenarioContext: string
): Promise<ConversationAnalysis> {
  try {
    const systemPrompt = `Analyze this care conversation for learning insights.

SCENARIO: ${scenarioContext.substring(0, 200)}...

FULL CONVERSATION:
${conversationHistory.map(h => `${h.role}: ${h.message}`).join('\n')}

Assess:
1. How is the care worker's approach evolving?
2. What key opportunities are they missing?
3. What are they doing well?
4. What direction should the conversation take?
5. What's the patient's likely emotional state?

Return JSON:
{
  "toneShift": "improving|declining|stable",
  "engagementLevel": 1-10,
  "missedOpportunities": ["specific missed opportunity", "another opportunity"],
  "strongMoments": ["what they did well", "another strength"],
  "suggestedDirection": "Next strategic focus for the conversation",
  "emotionalState": "distressed|calm|agitated|confused|responsive"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze conversation flow." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 250,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      toneShift: result.toneShift || 'stable',
      engagementLevel: result.engagementLevel || 5,
      missedOpportunities: result.missedOpportunities || [],
      strongMoments: result.strongMoments || [],
      suggestedDirection: result.suggestedDirection || "Continue building rapport",
      emotionalState: result.emotionalState || 'calm'
    };
  } catch (error) {
    console.error('Error analyzing conversation flow:', error);
    return {
      toneShift: 'stable',
      engagementLevel: 5,
      missedOpportunities: [],
      strongMoments: [],
      suggestedDirection: "Continue building rapport",
      emotionalState: 'calm'
    };
  }
}

// Generate alternative response suggestions for learning
export async function generateAlternativeResponses(
  userResponse: string,
  scenarioContext: string,
  conversationHistory: { role: 'user' | 'character'; message: string }[]
): Promise<AlternativeResponse[]> {
  try {
    const systemPrompt = `Generate 3 alternative responses to help the care worker learn different approaches.

SCENARIO: ${scenarioContext.substring(0, 200)}...
THEIR RESPONSE: "${userResponse}"
CONTEXT: ${conversationHistory.slice(-2).map(h => `${h.role}: ${h.message}`).join('\n')}

Create 3 alternative responses focusing on different care skills:
1. Empathetic approach (emotional validation)
2. Professional approach (boundaries and protocols)  
3. Problem-solving approach (practical solutions)

Each should be realistic, appropriate, and demonstrate a specific skill.

Return JSON:
{
  "alternatives": [
    {
      "category": "empathetic|professional|problem-solving",
      "text": "Alternative response text",
      "explanation": "Why this approach works (15 words max)",
      "skillFocus": "Specific skill demonstrated"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate alternatives." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.alternatives || [];
  } catch (error) {
    console.error('Error generating alternatives:', error);
    return [];
  }
}

// Generate contextual communication tips
export async function generateCommunicationTips(
  scenarioType: string,
  patientBackground: string,
  currentIssue: string
): Promise<string[]> {
  try {
    const systemPrompt = `Generate 3-4 specific communication tips for this care scenario.

SCENARIO TYPE: ${scenarioType}
PATIENT BACKGROUND: ${patientBackground.substring(0, 150)}...
CURRENT ISSUE: ${currentIssue}

Provide practical, actionable communication techniques specific to this situation.
Focus on what words to use, tone, body language, or approach.

Return JSON:
{
  "tips": ["Specific actionable tip", "Another tip", "Third tip"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate communication tips." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.tips || [];
  } catch (error) {
    console.error('Error generating communication tips:', error);
    return [];
  }
}