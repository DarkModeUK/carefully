import { db } from "./db";
import { scenarios } from "@shared/schema";

const dementiaScenarios = [
  {
    id: "dem-001",
    title: "Sundowning and Evening Agitation",
    description: "Help a person with dementia who becomes increasingly agitated as evening approaches.",
    category: "dementia_care",
    difficulty: "intermediate",
    estimatedTime: 12,
    priority: "high",
    context: "Mr. Thompson has dementia and every evening around 5 PM he becomes restless, confused, and agitated. He keeps asking for his wife who passed away 5 years ago and wants to 'go home' even though he's been living in the care facility for 2 years. Tonight he's particularly distressed, pacing the hallway and becoming upset with staff.",
    learningObjectives: [
      "Understand sundowning syndrome in dementia",
      "Practice de-escalation techniques for agitated residents",
      "Learn validation therapy approaches",
      "Develop strategies for redirecting confused behaviour"
    ]
  },
  {
    id: "dem-002", 
    title: "Memory Care: Repeated Questions",
    description: "Support someone with dementia who asks the same questions repeatedly throughout the day.",
    category: "dementia_care",
    difficulty: "beginner",
    estimatedTime: 10,
    priority: "medium",
    context: "Mrs. Davies has moderate dementia and asks 'When is my daughter coming?' approximately every 10 minutes. Her daughter visits weekly on Sundays, but Mrs. Davies cannot retain this information. Staff are becoming frustrated with the constant repetition, and Mrs. Davies is becoming more anxious each time she asks.",
    learningObjectives: [
      "Practice patient responses to repetitive questions",
      "Learn memory care communication techniques",
      "Understand the emotional needs behind repeated questions",
      "Develop empathy for memory loss experiences"
    ]
  },
  {
    id: "dem-003",
    title: "Personal Care Resistance", 
    description: "Navigate care assistance when a person with dementia refuses personal hygiene help.",
    category: "dementia_care",
    difficulty: "advanced",
    estimatedTime: 15,
    priority: "high",
    context: "Mr. Foster has dementia and hasn't bathed in a week. When care staff approach him about washing, he becomes defensive, saying he 'just had a bath' and doesn't need help. He's beginning to have a strong odour and other residents are complaining. His dignity is important, but hygiene is becoming a health concern.",
    learningObjectives: [
      "Preserve dignity while providing necessary care",
      "Learn gentle persuasion techniques",
      "Understand resistance as communication",
      "Practice person-centred care approaches"
    ]
  },
  {
    id: "dem-004",
    title: "Wandering and Safety Concerns",
    description: "Manage a situation where someone with dementia is trying to leave the facility unsupervised.",
    category: "dementia_care", 
    difficulty: "intermediate",
    estimatedTime: 12,
    priority: "high",
    context: "Mrs. Chen has dementia and believes she needs to pick up her children from school (her children are now adults). She's found by the exit door with her coat on, looking distressed and saying she's 'late for the children'. She's tried to leave several times today and is becoming increasingly upset when prevented from leaving.",
    learningObjectives: [
      "Practice safe redirection techniques",
      "Learn to validate emotional needs",
      "Understand wandering triggers",
      "Develop creative distraction strategies"
    ]
  },
  {
    id: "dem-005",
    title: "Eating Difficulties and Nutrition",
    description: "Support someone with dementia who has stopped eating regularly and shows signs of weight loss.",
    category: "dementia_care",
    difficulty: "intermediate", 
    estimatedTime: 13,
    priority: "medium",
    context: "Mr. Williams has dementia and has lost interest in food. He often forgets to eat, doesn't recognise meal times, and sometimes doesn't remember how to use utensils. His family is concerned about his weight loss, and the care team needs to find ways to encourage proper nutrition while maintaining his independence and dignity.",
    learningObjectives: [
      "Understand eating challenges in dementia",
      "Learn adaptive feeding techniques",
      "Practice encouraging independence",
      "Address family concerns sensitively"
    ]
  },
  {
    id: "dem-006",
    title: "Medication Refusal and Compliance",
    description: "Handle a situation where someone with dementia consistently refuses to take essential medications.",
    category: "dementia_care",
    difficulty: "advanced",
    estimatedTime: 14,
    priority: "high",
    context: "Mrs. Patterson has dementia and diabetes. She refuses to take her essential medications, believing they are 'poison' or that she doesn't need them. She becomes agitated when staff approach with medications and has hidden pills around her room. Her blood sugar levels are becoming concerning, and the family is worried about her health.",
    learningObjectives: [
      "Navigate medication adherence challenges",
      "Learn trust-building techniques",
      "Understand paranoia in dementia",
      "Practice creative medication administration"
    ]
  },
  {
    id: "dem-007",
    title: "Sleep Disturbances and Night-time Care",
    description: "Manage night-time care for someone with dementia experiencing sleep pattern disruption.",
    category: "dementia_care",
    difficulty: "intermediate",
    estimatedTime: 11,
    priority: "medium", 
    context: "Mr. Garcia has dementia and his sleep patterns are completely reversed. He sleeps most of the day and is wide awake at night, often calling out, trying to get dressed, and asking for breakfast at 3 AM. This is disturbing other residents and exhausting night staff. He seems confused about time and becomes upset when told it's night-time.",
    learningObjectives: [
      "Understand circadian rhythm disruption",
      "Learn night-time communication strategies", 
      "Practice gentle reorientation techniques",
      "Develop patience for confused behaviours"
    ]
  },
  {
    id: "dem-008",
    title: "Communication Challenges and Language Loss",
    description: "Connect with someone whose dementia has significantly affected their ability to communicate verbally.",
    category: "dementia_care",
    difficulty: "advanced", 
    estimatedTime: 16,
    priority: "medium",
    context: "Mrs. Kumar has advanced dementia and has lost most of her verbal communication skills. She often seems frustrated when trying to express needs, sometimes becoming upset or withdrawn. Her family feels disconnected from her, and staff struggle to understand what she needs. She responds to touch and facial expressions but words are increasingly difficult for her.",
    learningObjectives: [
      "Learn non-verbal communication techniques",
      "Practice reading emotional cues",
      "Understand language loss in dementia",
      "Support family communication"
    ]
  }
];

export async function seedDementiaScenarios() {
  console.log("🌱 Seeding dementia scenarios...");
  
  for (const scenario of dementiaScenarios) {
    try {
      // Check if scenario already exists
      const existing = await db.query.scenarios.findFirst({
        where: (scenarios, { eq }) => eq(scenarios.id, scenario.id)
      });
      
      if (!existing) {
        await db.insert(scenarios).values(scenario);
        console.log(`✅ Added scenario: ${scenario.title}`);
      } else {
        console.log(`⏭️ Scenario already exists: ${scenario.title}`);
      }
    } catch (error) {
      console.error(`❌ Error seeding scenario ${scenario.title}:`, error);
    }
  }
  
  console.log("🎉 Dementia scenarios seeding completed!");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDementiaScenarios()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}