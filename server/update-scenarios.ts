import { db } from "./db";
import { scenarios } from "@shared/schema";
import { eq } from "drizzle-orm";

const enhancedScenarios = [
  {
    id: "c2d47a59-416b-4393-8fdf-9cd58220d4d1",
    context: `Meet Margaret, a 78-year-old retired teacher who has been living with moderate dementia for 18 months. She moved to your care facility 6 months ago after her daughter could no longer provide full-time care at home. Margaret was once fiercely independent, teaching primary school for 40 years and raising three children as a single mother after her husband passed away when she was 45.

Currently, Margaret becomes confused about time and place, especially in the evenings. She often believes she needs to prepare lessons for tomorrow's class or collect her children from school. Her short-term memory is significantly affected, but she retains vivid memories of her teaching days and speaks fondly of her former students. Margaret has maintained her gentle, caring nature but becomes distressed when she can't remember recent conversations or familiar faces.

Today, Margaret approaches you in the corridor looking worried and slightly agitated. She's holding her handbag tightly and seems ready to leave the building.`,
    learningObjectives: [
      "Apply validation therapy techniques to acknowledge Margaret's emotional reality without correcting her confusion",
      "Demonstrate effective de-escalation strategies for managing anxiety and agitation in dementia care",
      "Practice person-centred communication that respects Margaret's dignity and life history",
      "Develop skills in redirecting confused behaviour using Margaret's personal interests and memories",
      "Learn to identify and respond appropriately to the underlying needs expressed through confused behaviour"
    ]
  },
  {
    id: "dem-001",
    context: `Meet Harold Thompson, an 82-year-old former bus driver who has been living with Alzheimer's disease for 3 years. Harold worked the same bus route in Manchester for 35 years, known by regular passengers as cheerful and reliable. He's been married to his wife Edith for 58 years, though she passed away 5 years ago from cancer. Harold has two adult children who visit weekly but live several hours away.

Harold moved into care 8 months ago when living alone became unsafe. He maintains his friendly demeanor during the day but experiences significant sundowning symptoms. Every evening around 5 PM, Harold becomes increasingly restless and confused. He believes he needs to finish his bus route and go home to Edith, who he often thinks is waiting for him with dinner ready. The care team notices he paces the hallways, checks his watch repeatedly, and becomes upset when staff try to redirect him.

Tonight is particularly challenging - Harold has been asking about Edith every few minutes and is now standing by the main door with his coat on, insisting he must get home before dark.`,
    learningObjectives: [
      "Understand the neurological and psychological factors that contribute to sundowning syndrome in dementia",
      "Master gentle redirection techniques that don't challenge Harold's reality but guide him toward calming activities",
      "Practice therapeutic communication that validates Harold's emotions while maintaining his safety",
      "Learn to use Harold's personal history and routine preferences to create effective interventions",
      "Develop confidence in managing repetitive requests about deceased loved ones with compassion and skill"
    ]
  },
  {
    id: "dem-002",
    context: `Meet Dorothy Davies, a 75-year-old former nurse who worked in the local hospital's children's ward for 42 years before retiring. Dorothy has moderate dementia and has been in care for 14 months. She was always known for her attention to detail and caring nature with young patients. Dorothy has one daughter, Sarah, who is a busy working mother of two teenagers and visits every Sunday afternoon without fail.

Dorothy's dementia particularly affects her short-term memory, though she can still recall detailed stories from her nursing days. She has developed a pattern of asking about Sarah's visit approximately every 10 minutes throughout the week. Each time she asks "When is my daughter coming?", she becomes visibly anxious when she can't remember the answer. The repetition has begun to frustrate some staff members, and Dorothy senses their irritation, which increases her own anxiety.

Today, Dorothy has asked about Sarah's visit 15 times in the past two hours. She's becoming more agitated with each question, and you notice her wringing her hands and looking toward the entrance repeatedly.`,
    learningObjectives: [
      "Develop patience and empathy when responding to repetitive questions without showing frustration",
      "Learn memory support techniques including visual cues, written reminders, and consistent verbal responses",
      "Practice therapeutic responses that address the emotional need behind repetitive questioning",
      "Understand how anxiety and memory loss interact to create cycles of distress in dementia care",
      "Master communication strategies that reassure without making promises about specific timing or events"
    ]
  },
  {
    id: "dem-003",
    context: `Meet Robert Foster, an 79-year-old retired army sergeant who served for 30 years before working as a security guard until age 70. Robert has moderate to severe dementia and has been in care for 10 months. Throughout his life, Robert maintained strict personal standards and took pride in his appearance and independence. He was married for 45 years until his wife passed 3 years ago, and he has one son who lives abroad and calls weekly.

Robert's military background shaped his preference for routine and order, but dementia has made him suspicious of authority and resistant to help. He often doesn't recognise care staff and perceives personal care assistance as an invasion of privacy or dignity. Robert hasn't bathed properly in over a week, despite multiple gentle attempts by staff. He insists he "just washed" and becomes defensive, sometimes raising his voice when approached about hygiene.

The situation has reached a point where Robert has a noticeable odour, and other residents have begun to complain. His son expressed concern during yesterday's phone call about maintaining his father's dignity while ensuring proper care.`,
    learningObjectives: [
      "Navigate the delicate balance between respecting autonomy and ensuring essential personal care needs are met",
      "Develop skills in approaching personal care resistance without triggering defensive or aggressive responses",
      "Learn to use Robert's military background and personal history to frame care activities positively",
      "Practice building trust and rapport before attempting care tasks with resistant individuals",
      "Master techniques for preserving dignity while providing necessary assistance with activities of daily living"
    ]
  },
  {
    id: "dem-004",
    context: `Meet Lily Chen, a 73-year-old former seamstress who immigrated to the UK from Hong Kong 45 years ago. Lily worked in a local textile factory and later ran a small alterations shop with her late husband. She has moderate dementia and has been in care for 7 months. Lily was devoted to her family, raising four children who are now successful adults living across the country. Her primary language was Cantonese, though she learned English for her business.

As her dementia progressed, Lily has reverted to primarily speaking Cantonese and often becomes confused about time and place. She frequently believes she needs to collect her children from school, despite them being adults aged 45-52. This morning, she's been particularly agitated, convinced that her youngest son (now 45) needs to be picked up from primary school. She's been found by the exit door three times, wearing her coat and carrying her handbag.

Lily becomes very distressed when prevented from leaving, sometimes crying and speaking rapidly in Cantonese. The care team suspects she's expressing worry about her children's safety, but the language barrier makes communication challenging. She's now standing by the door again, looking anxious and checking her watch repeatedly.`,
    learningObjectives: [
      "Develop cultural sensitivity and communication strategies for working with individuals who have language barriers in dementia care",
      "Learn safe and gentle intervention techniques for preventing unsafe wandering without causing distress",
      "Practice using non-verbal communication, body language, and tone to provide reassurance across language differences",
      "Understand how cultural background and family roles influence behaviour in dementia and use this knowledge therapeutically",
      "Master redirection techniques that acknowledge the person's emotional needs while ensuring their physical safety"
    ]
  },
  {
    id: "dem-005",
    context: `Meet George Williams, an 81-year-old retired carpenter who built furniture for local families for over 50 years. George has moderate dementia and has been in care for 11 months following a fall at home. He was known in his community for his craftsmanship and generous nature, often making toys for children at Christmas. George was married for 55 years until his wife's death 2 years ago, and he has three children who visit regularly but live several hours away.

George's dementia has significantly affected his ability to recognise meal times, remember to eat, and use utensils properly. He's lost 15 pounds over the past 4 months, causing concern for his family and medical team. Sometimes George doesn't recognise food items or forgets how to use a fork and knife. He often pushes food around his plate without eating, or gets distracted and wanders away mid-meal. Occasionally, he becomes suspicious that the food might be poisoned or refuses meals entirely.

His daughter Sarah called yesterday, very worried about her father's weight loss. She mentioned that George used to love cooking Sunday roasts and always had a healthy appetite. Today, George is sitting at the dining table with his lunch untouched, staring at his plate with a confused expression.`,
    learningObjectives: [
      "Understand the complex relationship between dementia, appetite, and eating behaviours in older adults",
      "Learn adaptive feeding techniques that promote independence while ensuring adequate nutrition",
      "Develop skills in creating positive mealtime environments that reduce anxiety and confusion",
      "Practice using food preferences and personal history to encourage eating and engagement with meals",
      "Master communication strategies with families about nutrition concerns while maintaining realistic expectations"
    ]
  },
  {
    id: "dem-006",
    context: `Meet Eleanor Patterson, a 76-year-old former librarian who has Type 2 diabetes and moderate dementia. Eleanor worked at the local library for 38 years, known for her vast knowledge of books and her gentle way with children during story time. She has been in care for 13 months after her diabetes management became unsafe while living alone. Eleanor has no children but was very close to her late sister and has several devoted nieces and nephews who visit regularly.

Eleanor's dementia has created significant challenges with her diabetes management. She needs to take medication twice daily and monitor her blood sugar, but she often doesn't understand why she needs medicine when she "feels fine." Sometimes Eleanor believes the medications are "poison" or that staff are trying to harm her. She's developed a pattern of hiding pills in her room or pretending to take them. Her blood sugar levels have become increasingly unstable, and her doctor is concerned about serious complications.

This morning, Eleanor is due for her morning medications, including her essential diabetes medication. When you approach with her pill organiser, she immediately becomes suspicious and backs away, saying "I don't need those - you're trying to make me sick!"`,
    learningObjectives: [
      "Navigate complex medication adherence challenges while respecting the person's autonomy and addressing their fears",
      "Understand how paranoia and suspicion in dementia can interfere with essential medical care",
      "Learn creative approaches to medication administration that build trust and reduce resistance",
      "Develop skills in explaining medical necessity in ways that make sense to someone with cognitive impairment",
      "Master techniques for involving family members and medical teams in medication management strategies"
    ]
  },
  {
    id: "dem-007",
    context: `Meet Antonio Garcia, a 74-year-old former chef who ran a popular family restaurant for 40 years. Antonio has moderate dementia and has been in care for 9 months. He immigrated from Spain as a young man and built a successful business known for its authentic cuisine and warm atmosphere. Antonio was married for 48 years until his wife's death 18 months ago, and he has four adult children who take turns visiting throughout the week.

Antonio's circadian rhythm has become completely disrupted due to his dementia. He sleeps most of the day and is wide awake at night, often becoming active around 2 AM. During these nighttime episodes, Antonio believes it's morning and time to open his restaurant. He gets dressed, asks for his apron, and becomes confused when he can't find his kitchen. He sometimes calls out for his wife Maria or asks staff where his employees are. His nighttime activity disturbs other residents, and night staff feel uncertain how to help him.

Tonight, Antonio is awake at 3 AM, fully dressed and agitated. He's asking why the restaurant isn't ready for the breakfast rush and seems genuinely confused about why it's dark outside. He's starting to raise his voice, which is waking up neighbouring residents.`,
    learningObjectives: [
      "Understand circadian rhythm disorders in dementia and their impact on both the individual and care environment",
      "Learn gentle reorientation techniques that don't confront the person's reality but guide them toward rest",
      "Develop skills in using personal history and familiar roles to create calming nighttime interventions",
      "Practice managing challenging behaviours during night shifts while maintaining a peaceful environment for all residents",
      "Master communication strategies that validate the person's purpose and identity while promoting appropriate sleep patterns"
    ]
  },
  {
    id: "dem-008",
    context: `Meet Priya Kumar, a 71-year-old former teacher who immigrated to the UK from India 40 years ago. Priya has advanced dementia and has been in care for 15 months. She taught mathematics at a secondary school for 35 years and was beloved by students for her patience and clarity. Priya was married for 45 years until her husband's death 3 years ago, and she has two adult children - a son who is a doctor and a daughter who is an engineer, both living nearby and visiting frequently.

Priya's dementia has progressed to the point where she has lost most of her verbal communication abilities. She understands some simple words and phrases but can no longer form complete sentences or express complex thoughts. Her family reports that she becomes visibly frustrated when trying to communicate, sometimes becoming tearful or withdrawn. Recently, she's been refusing food and seems to pull away when staff approach for personal care. Her children are heartbroken watching their once-articulate mother struggle to communicate.

Today, Priya appears distressed and is making gestures toward her stomach area while making soft sounds. She looks uncomfortable but can't explain what's wrong. Her daughter visits this afternoon and always asks staff how her mother is communicating and what they think she might need.`,
    learningObjectives: [
      "Develop advanced non-verbal communication skills for working with individuals who have severe communication impairments",
      "Learn to interpret body language, facial expressions, and gestures to understand unmet needs",
      "Practice using touch, tone of voice, and environmental cues to provide comfort and reassurance",
      "Understand how to support families in connecting with loved ones who can no longer communicate verbally",
      "Master patience and observation skills needed to provide person-centred care without verbal guidance from the individual"
    ]
  }
];

export async function updateScenarios() {
  console.log("🔄 Updating scenario contexts and learning objectives...");
  
  for (const scenarioUpdate of enhancedScenarios) {
    try {
      const result = await db
        .update(scenarios)
        .set({
          context: scenarioUpdate.context,
          learningObjectives: scenarioUpdate.learningObjectives,
        })
        .where(eq(scenarios.id, scenarioUpdate.id))
        .returning();
      
      if (result.length > 0) {
        console.log(`✅ Updated scenario: ${result[0].title}`);
      } else {
        console.log(`⚠️ Scenario not found: ${scenarioUpdate.id}`);
      }
    } catch (error) {
      console.error(`❌ Error updating scenario ${scenarioUpdate.id}:`, error);
    }
  }
  
  console.log("🎉 Scenario updates completed!");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateScenarios()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}