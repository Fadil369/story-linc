import { StoryTemplate } from './storyTemplates'

export interface PromptSuggestion {
  id: string
  prompt: string
  promptAr: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedLength: 'short' | 'medium' | 'long'
}

export const occasionPrompts: Record<string, PromptSuggestion[]> = {
  bedtime: [
    {
      id: 'gentle-forest',
      prompt: 'A magical forest where all the animals gather each night to share stories and help each other solve problems',
      promptAr: 'غابة سحرية حيث تجتمع جميع الحيوانات كل ليلة لتتبادل القصص وتساعد بعضها البعض في حل المشاكل',
      category: 'children',
      tags: ['peaceful', 'animals', 'friendship'],
      difficulty: 'beginner',
      estimatedLength: 'short'
    },
    {
      id: 'sleepy-moon',
      prompt: 'The moon has trouble falling asleep and asks the stars to sing lullabies',
      promptAr: 'القمر يواجه صعوبة في النوم ويطلب من النجوم أن تغني له التهويدات',
      category: 'children',
      tags: ['peaceful', 'celestial', 'music'],
      difficulty: 'beginner',
      estimatedLength: 'short'
    }
  ],
  
  holiday: [
    {
      id: 'winter-celebration',
      prompt: 'A small village prepares for their annual winter festival, but the magical snow globe that creates their snow has gone missing',
      promptAr: 'قرية صغيرة تستعد لمهرجان الشتاء السنوي، لكن الكرة الثلجية السحرية التي تخلق الثلج قد اختفت',
      category: 'fantasy',
      tags: ['celebration', 'magic', 'community'],
      difficulty: 'intermediate',
      estimatedLength: 'medium'
    },
    {
      id: 'harvest-feast',
      prompt: 'Two rival families must work together to save their harvest festival when a mysterious blight threatens their crops',
      promptAr: 'عائلتان متنافستان يجب أن تعملا معاً لإنقاذ مهرجان الحصاد عندما تهدد آفة غامضة محاصيلهما',
      category: 'adventure',
      tags: ['cooperation', 'challenge', 'tradition'],
      difficulty: 'intermediate',
      estimatedLength: 'medium'
    }
  ],
  
  educational: [
    {
      id: 'time-travel-history',
      prompt: 'A young student discovers their history book can transport them to any historical period they read about',
      promptAr: 'طالب صغير يكتشف أن كتاب التاريخ الخاص به يمكنه نقله إلى أي فترة تاريخية يقرأ عنها',
      category: 'scifi',
      tags: ['learning', 'history', 'adventure'],
      difficulty: 'intermediate',
      estimatedLength: 'medium'
    },
    {
      id: 'kindness-chain',
      prompt: 'A simple act of kindness starts a chain reaction that transforms an entire community',
      promptAr: 'عمل بسيط من أعمال اللطف يبدأ تفاعلاً متسلسلاً يحول مجتمعاً بأكمله',
      category: 'children',
      tags: ['kindness', 'community', 'inspiration'],
      difficulty: 'beginner',
      estimatedLength: 'short'
    }
  ],

  'adventure-time': [
    {
      id: 'treasure-island',
      prompt: 'A mysterious map leads to an island where each challenge teaches the explorers something valuable about themselves',
      promptAr: 'خريطة غامضة تقود إلى جزيرة حيث يعلم كل تحدٍ المستكشفين شيئاً قيماً عن أنفسهم',
      category: 'adventure',
      tags: ['exploration', 'self-discovery', 'treasure'],
      difficulty: 'advanced',
      estimatedLength: 'long'
    },
    {
      id: 'sky-pirates',
      prompt: 'Air pirates sailing through clouds discover a floating city in danger and must choose between treasure and heroism',
      promptAr: 'قراصنة جوية تبحر عبر السحب تكتشف مدينة عائمة في خطر ويجب أن تختار بين الكنز والبطولة',
      category: 'adventure',
      tags: ['pirates', 'fantasy', 'moral-choice'],
      difficulty: 'advanced',
      estimatedLength: 'long'
    }
  ],

  'romantic-evening': [
    {
      id: 'coffee-shop-meeting',
      prompt: 'Two writers unknowingly compete for the same quiet corner table at a coffee shop every day, until a power outage forces them to share',
      promptAr: 'كاتبان يتنافسان دون معرفة على نفس الطاولة الهادئة في المقهى كل يوم، حتى يجبرهما انقطاع الكهرباء على المشاركة',
      category: 'romance',
      tags: ['writers', 'coincidence', 'slow-burn'],
      difficulty: 'intermediate',
      estimatedLength: 'medium'
    },
    {
      id: 'letter-exchange',
      prompt: 'An old postal worker discovers a bag of undelivered love letters from decades ago and decides to deliver them, changing lives in unexpected ways',
      promptAr: 'عامل بريد عجوز يكتشف كيساً من رسائل الحب غير المُسلمة من عقود مضت ويقرر تسليمها، مما يغير الحياة بطرق غير متوقعة',
      category: 'romance',
      tags: ['letters', 'second-chances', 'destiny'],
      difficulty: 'advanced',
      estimatedLength: 'long'
    }
  ],

  'spooky-night': [
    {
      id: 'friendly-ghost',
      prompt: 'A lonely ghost in an old mansion just wants someone to play board games with',
      promptAr: 'شبح وحيد في قصر قديم يريد فقط أن يلعب ألعاب الطاولة مع شخص ما',
      category: 'horror',
      tags: ['friendly', 'loneliness', 'games'],
      difficulty: 'beginner',
      estimatedLength: 'short'
    },
    {
      id: 'mystery-locked-room',
      prompt: 'Guests at a dinner party find themselves trapped in a mansion where each room holds a different mystery that must be solved to escape',
      promptAr: 'ضيوف حفل عشاء يجدون أنفسهم محاصرين في قصر حيث تحتوي كل غرفة على لغز مختلف يجب حله للهروب',
      category: 'mystery',
      tags: ['puzzle', 'trapped', 'cooperation'],
      difficulty: 'advanced',
      estimatedLength: 'long'
    }
  ]
}

export const seasonalPrompts: PromptSuggestion[] = [
  {
    id: 'spring-awakening',
    prompt: 'A garden fairy awakens from winter slumber to find the world has changed, and must learn to adapt to new challenges',
    promptAr: 'جنية حديقة تستيقظ من سبات الشتاء لتجد أن العالم قد تغير، ويجب أن تتعلم التكيف مع التحديات الجديدة',
    category: 'fantasy',
    tags: ['spring', 'change', 'adaptation'],
    difficulty: 'intermediate',
    estimatedLength: 'medium'
  },
  {
    id: 'summer-night-magic',
    prompt: 'On the longest day of summer, all the fireflies in the forest gather to perform an ancient ritual that grants one wish',
    promptAr: 'في أطول نهار صيفي، تجتمع جميع اليراعات في الغابة لأداء طقوس قديمة تحقق أمنية واحدة',
    category: 'fantasy',
    tags: ['summer', 'magic', 'wish'],
    difficulty: 'intermediate',
    estimatedLength: 'medium'
  },
  {
    id: 'autumn-memories',
    prompt: 'An old tree shares its memories with a young sapling as its leaves begin to fall for the last time',
    promptAr: 'شجرة عجوز تشارك ذكرياتها مع شتلة صغيرة بينما تبدأ أوراقها بالسقوط للمرة الأخيرة',
    category: 'children',
    tags: ['autumn', 'wisdom', 'legacy'],
    difficulty: 'intermediate',
    estimatedLength: 'short'
  },
  {
    id: 'winter-warmth',
    prompt: 'During the coldest winter in decades, neighbors who have never spoken must work together to survive',
    promptAr: 'خلال أبرد شتاء منذ عقود، يجب على الجيران الذين لم يتحدثوا مطلقاً أن يعملوا معاً للبقاء على قيد الحياة',
    category: 'adventure',
    tags: ['winter', 'cooperation', 'survival'],
    difficulty: 'advanced',
    estimatedLength: 'long'
  }
]

export const writingExercises: PromptSuggestion[] = [
  {
    id: 'dialogue-only',
    prompt: 'Write a story told entirely through dialogue between two characters waiting for a bus',
    promptAr: 'اكتب قصة تُروى بالكامل من خلال الحوار بين شخصين ينتظران الحافلة',
    category: 'exercise',
    tags: ['dialogue', 'constraint', 'character-development'],
    difficulty: 'advanced',
    estimatedLength: 'short'
  },
  {
    id: 'five-senses',
    prompt: 'A character explores an abandoned building using only their five senses to discover its history',
    promptAr: 'شخصية تستكشف مبنى مهجوراً باستخدام حواسها الخمس فقط لاكتشاف تاريخه',
    category: 'exercise',
    tags: ['senses', 'description', 'mystery'],
    difficulty: 'intermediate',
    estimatedLength: 'medium'
  },
  {
    id: 'reverse-chronology',
    prompt: 'Tell a love story backwards, starting with the goodbye and ending with the first meeting',
    promptAr: 'احك قصة حب بالعكس، ابدأ بالوداع وانته بأول لقاء',
    category: 'exercise',
    tags: ['structure', 'romance', 'experimental'],
    difficulty: 'advanced',
    estimatedLength: 'medium'
  }
]

export function getPromptsByOccasion(occasionId: string): PromptSuggestion[] {
  return occasionPrompts[occasionId] || []
}

export function getSeasonalPrompts(): PromptSuggestion[] {
  const currentMonth = new Date().getMonth()
  // Spring: Mar-May (2-4), Summer: Jun-Aug (5-7), Autumn: Sep-Nov (8-10), Winter: Dec-Feb (11,0,1)
  const season = currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
                 currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
                 currentMonth >= 8 && currentMonth <= 10 ? 'autumn' : 'winter'
  
  return seasonalPrompts.filter(prompt => prompt.tags.includes(season))
}

export function getRandomPrompt(category?: string, difficulty?: string): PromptSuggestion {
  const allPrompts = [
    ...Object.values(occasionPrompts).flat(),
    ...seasonalPrompts,
    ...writingExercises
  ]
  
  let filteredPrompts = allPrompts
  
  if (category) {
    filteredPrompts = filteredPrompts.filter(p => p.category === category)
  }
  
  if (difficulty) {
    filteredPrompts = filteredPrompts.filter(p => p.difficulty === difficulty)
  }
  
  if (filteredPrompts.length === 0) {
    filteredPrompts = allPrompts
  }
  
  return filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)]
}