/**
 * Mock story generation service to replace @github/spark functionality
 * This provides placeholder story generation for development and testing
 */

interface StoryGenerationResult {
  content: string;
}

// Sample story templates for different languages and themes
const storyTemplates = {
  en: {
    adventure: [
      "The brave explorer ventured deep into the {setting}, where ancient secrets lay hidden beneath layers of moss and time. As they pushed through the undergrowth, a glimmering light caught their attention...",
      "With determination in their heart, the adventurer stepped into the mysterious {setting}. The air was thick with magic, and every step revealed new wonders and hidden dangers...",
      "The legendary {setting} had been lost for centuries, but now our hero stood at its threshold. What mysteries would they uncover in this forgotten realm?"
    ],
    fantasy: [
      "In the realm of {setting}, where magic flows like rivers and creatures of legend roam free, an extraordinary tale begins. The ancient prophecy spoke of this moment...",
      "Beneath the starlit sky, the enchanted {setting} pulsed with ethereal energy. Dragons soared overhead while mystical beings whispered secrets of old...",
      "The magical {setting} held powers beyond imagination. As our protagonist entered this realm, they felt the very air shimmer with possibilities..."
    ],
    mystery: [
      "The enigmatic {setting} concealed dark secrets within its shadows. Every corner seemed to whisper clues about a mystery that had puzzled investigators for years...",
      "Something wasn't right about the {setting}. The silence was too perfect, the atmosphere too tense. A mystery was waiting to be unraveled...",
      "In the depths of {setting}, evidence of an ancient mystery lay scattered like breadcrumbs, waiting for someone clever enough to piece it together..."
    ],
    romance: [
      "The romantic {setting} set the perfect stage for an unexpected encounter. Hearts would be opened, feelings revealed, and love would bloom in the most unlikely of places...",
      "Under the gentle glow of twilight, the beautiful {setting} became a sanctuary for two souls destined to find each other...",
      "The charming {setting} had witnessed countless love stories, and today it would host another tale of hearts intertwining..."
    ],
    default: [
      "The story begins in {setting}, where an unexpected journey is about to unfold. Our protagonist couldn't have imagined what lay ahead...",
      "In the heart of {setting}, a tale of wonder and discovery was about to begin. The ordinary was about to become extraordinary...",
      "The {setting} seemed peaceful enough, but beneath the surface, an incredible adventure was waiting to begin..."
    ]
  },
  ar: {
    adventure: [
      "انطلق المستكشف الشجاع في أعماق {setting}، حيث تكمن الأسرار القديمة تحت طبقات من الطحالب والزمن. وبينما كان يشق طريقه عبر الأدغال، لفت انتباهه ضوء متلألئ...",
      "بعزيمة راسخة في قلبه، خطا المغامر إلى {setting} الغامض. كان الهواء كثيفاً بالسحر، وكل خطوة تكشف عجائب جديدة ومخاطر خفية...",
      "لقد فُقد {setting} الأسطوري لقرون، لكن بطلنا يقف الآن على عتبته. أي أسرار سيكتشفها في هذا العالم المنسي؟"
    ],
    fantasy: [
      "في عالم {setting}، حيث يتدفق السحر كالأنهار وتجوب مخلوقات الأساطير بحرية، تبدأ حكاية استثنائية. تحدثت النبوءة القديمة عن هذه اللحظة...",
      "تحت السماء المرصعة بالنجوم، نبض {setting} المسحور بطاقة أثيرية. حلقت التنانين في الأعلى بينما همست الكائنات الصوفية بأسرار قديمة...",
      "احتوى {setting} السحري على قوى تفوق الخيال. عندما دخل بطل قصتنا إلى هذا العالم، شعر بالهواء نفسه يتلألأ بالإمكانيات..."
    ],
    mystery: [
      "أخفى {setting} الغامض أسراراً مظلمة بين ظلاله. كل زاوية بدت تهمس بأدلة حول لغز حيّر المحققين لسنوات...",
      "كان هناك شيء غير صحيح حول {setting}. كان الصمت مثالياً جداً، والجو متوتراً جداً. كان هناك لغز ينتظر الكشف عنه...",
      "في أعماق {setting}، كانت أدلة لغز قديم متناثرة كفتات الخبز، تنتظر شخصاً ذكياً بما فيه الكفاية لتجميعها..."
    ],
    romance: [
      "هيأ {setting} الرومانسي المسرح المثالي للقاء غير متوقع. ستنفتح القلوب، وتُكشف المشاعر، وسيزهر الحب في أكثر الأماكن غير المتوقعة...",
      "تحت الضوء اللطيف للشفق، أصبح {setting} الجميل ملاذاً لروحين مقدر لهما أن يجدا بعضهما البعض...",
      "شهد {setting} الساحر قصص حب لا تُحصى، واليوم سيستضيف حكاية أخرى لقلوب متشابكة..."
    ],
    default: [
      "تبدأ القصة في {setting}، حيث رحلة غير متوقعة على وشك أن تتكشف. لم يكن بإمكان بطلنا أن يتخيل ما ينتظره...",
      "في قلب {setting}، كانت حكاية من العجائب والاكتشاف على وشك أن تبدأ. العادي كان على وشك أن يصبح استثنائياً...",
      "بدا {setting} هادئاً بما فيه الكفاية، لكن تحت السطح، كانت مغامرة لا تصدق تنتظر البداية..."
    ]
  }
};

/**
 * Mock LLM prompt template function
 */
export function llmPrompt(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((result, string, i) => {
    const value = values[i] ? String(values[i]) : '';
    return result + string + value;
  }, '');
}

/**
 * Mock LLM function that generates stories based on prompts
 */
export async function llm(prompt: string, model: string = 'mock', structured: boolean = false): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Extract language and theme from prompt
  const isArabic = /[\u0600-\u06FF]/.test(prompt);
  const language = isArabic ? 'ar' : 'en';
  
  // Determine theme/category from prompt content
  let theme = 'default';
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('adventure') || promptLower.includes('explorer') || promptLower.includes('journey')) {
    theme = 'adventure';
  } else if (promptLower.includes('magic') || promptLower.includes('fantasy') || promptLower.includes('dragon')) {
    theme = 'fantasy';
  } else if (promptLower.includes('mystery') || promptLower.includes('secret') || promptLower.includes('detective')) {
    theme = 'mystery';
  } else if (promptLower.includes('love') || promptLower.includes('romance') || promptLower.includes('heart')) {
    theme = 'romance';
  }
  
  // Extract setting from prompt or use default
  let setting = isArabic ? 'مكان سحري' : 'magical place';
  const settingMatches = prompt.match(/(?:in|into|through|at|discover|find|explore)\s+(?:a|an|the)?\s*([^,.!?]+)/i);
  if (settingMatches && settingMatches[1]) {
    setting = settingMatches[1].trim();
  }
  
  // Get templates for the language and theme
  const templates = storyTemplates[language]?.[theme] || storyTemplates[language]?.default || storyTemplates.en.default;
  
  // Select a random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace placeholders and generate a fuller story
  let story = template.replace(/{setting}/g, setting);
  
  // Add more content to make it a complete story
  const continuations = isArabic ? [
    "\n\nبينما كان يستكشف أكثر، اكتشف أن هذا المكان يحمل قوة خاصة. الأشجار همست بأسرار قديمة، والهواء نفسه بدا محملاً بالسحر.",
    "\n\nفجأة، ظهر كائن غامض من بين الظلال. عيناه تلمعان بحكمة عصور، وكان واضحاً أنه حارس هذا المكان المقدس.",
    "\n\nوبينما كان يسير أعمق في هذا العالم المدهش، بدأ يفهم أن رحلته ستغير حياته إلى الأبد. هذه لم تكن مجرد مغامرة، بل مصير ينتظره."
  ] : [
    "\n\nAs they explored further, they discovered that this place held a special power. The trees whispered ancient secrets, and the very air seemed charged with magic.",
    "\n\nSudenly, a mysterious creature emerged from the shadows. Its eyes glowed with the wisdom of ages, and it was clear that it was the guardian of this sacred place.",
    "\n\nAs they ventured deeper into this wondrous realm, they began to understand that their journey would change their life forever. This wasn't just an adventure, but a destiny waiting to unfold."
  ];
  
  // Add 2-3 random continuations
  const numContinuations = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numContinuations; i++) {
    const continuation = continuations[Math.floor(Math.random() * continuations.length)];
    story += continuation;
  }
  
  // Add a compelling ending
  const endings = isArabic ? [
    "\n\nوهكذا انتهت المغامرة الأولى، لكن هذه كانت بداية لرحلة أعظم بكثير. العالم كان مليئاً بالعجائب التي تنتظر الاكتشاف.",
    "\n\nعندما نظر إلى الوراء، أدرك أن هذا اليوم غيّر كل شيء. المستقبل بدا مشرقاً بإمكانيات لا نهائية.",
    "\n\nوبقلب مليء بالذكريات الجديدة والحكمة المكتسبة، عرف أن هذه ليست النهاية، بل بداية لحكايات لا تُحصى."
  ] : [
    "\n\nAnd so ended the first adventure, but this was only the beginning of a much grander journey. The world was full of wonders waiting to be discovered.",
    "\n\nLooking back, they realized that this day had changed everything. The future seemed bright with endless possibilities.",
    "\n\nWith a heart full of new memories and hard-won wisdom, they knew this wasn't the end, but the beginning of countless tales yet to be told."
  ];
  
  story += endings[Math.floor(Math.random() * endings.length)];
  
  if (structured) {
    // Return structured data for analysis
    return JSON.stringify({
      content: story,
      language: language,
      theme: theme,
      setting: setting,
      wordCount: story.split(' ').length
    });
  }
  
  return story;
}

// Create a mock spark object to replace the removed dependency
export const spark = {
  llmPrompt,
  llm
};

// Export individual functions for direct use
export { llmPrompt as mockLlmPrompt, llm as mockLlm };