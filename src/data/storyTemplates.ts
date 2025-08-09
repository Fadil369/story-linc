export interface StoryTemplate {
  id: string
  name: string
  nameAr: string
  category: string
  description: string
  descriptionAr: string
  prompts: {
    en: string[]
    ar: string[]
  }
  placeholders: {
    en: string[]
    ar: string[]
  }
  themes: string[]
  mood: 'light' | 'dark' | 'mysterious' | 'romantic' | 'adventurous' | 'inspirational'
  icon: string
  color: string
}

export interface StoryOccasion {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  templates: string[] // template IDs
  icon: string
  color: string
}

export const storyTemplates: StoryTemplate[] = [
  // Adventure Templates
  {
    id: 'hero-journey',
    name: 'Hero\'s Journey',
    nameAr: 'رحلة البطل',
    category: 'adventure',
    description: 'Classic adventure where an ordinary person becomes a hero',
    descriptionAr: 'مغامرة كلاسيكية حيث يصبح شخص عادي بطلاً',
    prompts: {
      en: [
        'A young {character} discovers they have a special {power} and must {quest} to save {place}',
        'When {character} finds a mysterious {object}, they are thrust into an adventure to {goal}',
        'An unlikely hero {character} must overcome their fear of {obstacle} to rescue {target}'
      ],
      ar: [
        '{character} شاب يكتشف أن لديه {power} خاصة ويجب أن {quest} لإنقاذ {place}',
        'عندما يجد {character} {object} غامض، يُدفع إلى مغامرة {goal}',
        'بطل غير متوقع {character} يجب أن يتغلب على خوفه من {obstacle} لإنقاذ {target}'
      ]
    },
    placeholders: {
      en: ['character', 'power', 'quest', 'place', 'object', 'goal', 'obstacle', 'target'],
      ar: ['character', 'power', 'quest', 'place', 'object', 'goal', 'obstacle', 'target']
    },
    themes: ['courage', 'growth', 'destiny', 'friendship'],
    mood: 'adventurous',
    icon: 'Compass',
    color: 'bg-orange-500'
  },
  {
    id: 'treasure-hunt',
    name: 'Treasure Hunt',
    nameAr: 'البحث عن الكنز',
    category: 'adventure',
    description: 'An exciting quest to find hidden treasure',
    descriptionAr: 'مهمة مثيرة للعثور على كنز مخفي',
    prompts: {
      en: [
        'A map leading to {treasure} is discovered in {location}, but {character} must face {challenges}',
        'Legend speaks of {treasure} hidden in {place}, and {character} decides to find it',
        'When {character} inherits {clue}, they embark on a dangerous journey to find {treasure}'
      ],
      ar: [
        'يتم اكتشاف خريطة تؤدي إلى {treasure} في {location}، لكن {character} يجب أن يواجه {challenges}',
        'تتحدث الأساطير عن {treasure} مخفي في {place}، و{character} يقرر العثور عليه',
        'عندما يرث {character} {clue}، ينطلق في رحلة خطيرة للعثور على {treasure}'
      ]
    },
    placeholders: {
      en: ['treasure', 'location', 'character', 'challenges', 'place', 'clue'],
      ar: ['treasure', 'location', 'character', 'challenges', 'place', 'clue']
    },
    themes: ['adventure', 'discovery', 'perseverance', 'greed'],
    mood: 'adventurous',
    icon: 'MapPin',
    color: 'bg-yellow-500'
  },

  // Fantasy Templates
  {
    id: 'magical-world',
    name: 'Magical World',
    nameAr: 'العالم السحري',
    category: 'fantasy',
    description: 'Adventures in a world filled with magic and wonder',
    descriptionAr: 'مغامرات في عالم مليء بالسحر والعجائب',
    prompts: {
      en: [
        'In a world where {magic} is real, {character} discovers they are the chosen {role}',
        'A portal opens to {realm}, and {character} must master {ability} to return home',
        'When {character} touches {artifact}, they are transported to a magical {place}'
      ],
      ar: [
        'في عالم حيث {magic} حقيقي، يكتشف {character} أنه {role} المختار',
        'تفتح بوابة إلى {realm}، و{character} يجب أن يتقن {ability} للعودة إلى المنزل',
        'عندما يلمس {character} {artifact}، يتم نقله إلى {place} سحري'
      ]
    },
    placeholders: {
      en: ['magic', 'character', 'role', 'realm', 'ability', 'artifact', 'place'],
      ar: ['magic', 'character', 'role', 'realm', 'ability', 'artifact', 'place']
    },
    themes: ['magic', 'destiny', 'wonder', 'transformation'],
    mood: 'mysterious',
    icon: 'Sparkle',
    color: 'bg-purple-500'
  },

  // Romance Templates
  {
    id: 'unexpected-love',
    name: 'Unexpected Love',
    nameAr: 'الحب غير المتوقع',
    category: 'romance',
    description: 'A love story that blooms in unexpected circumstances',
    descriptionAr: 'قصة حب تزدهر في ظروف غير متوقعة',
    prompts: {
      en: [
        'Two strangers {character1} and {character2} meet during {event} and discover unexpected connection',
        'When {character} is forced to work with their {rival}, they slowly fall in love',
        'A chance encounter at {place} changes everything for {character} and {other}'
      ],
      ar: [
        'غريبان {character1} و{character2} يلتقيان أثناء {event} ويكتشفان ارتباطاً غير متوقع',
        'عندما يُجبر {character} على العمل مع {rival}، يقع في الحب تدريجياً',
        'لقاء صدفة في {place} يغير كل شيء لـ{character} و{other}'
      ]
    },
    placeholders: {
      en: ['character1', 'character2', 'event', 'character', 'rival', 'place', 'other'],
      ar: ['character1', 'character2', 'event', 'character', 'rival', 'place', 'other']
    },
    themes: ['love', 'growth', 'forgiveness', 'destiny'],
    mood: 'romantic',
    icon: 'Heart',
    color: 'bg-rose-500'
  },

  // Mystery Templates
  {
    id: 'detective-case',
    name: 'Detective Case',
    nameAr: 'قضية تحقيق',
    category: 'mystery',
    description: 'A puzzling mystery that needs to be solved',
    descriptionAr: 'لغز محير يحتاج إلى حل',
    prompts: {
      en: [
        'Detective {character} investigates the mysterious {crime} at {location}, but nothing is as it seems',
        'When {evidence} is found at {scene}, {character} realizes this case is bigger than expected',
        'A series of {incidents} leads {character} to uncover a dark secret about {target}'
      ],
      ar: [
        'المحقق {character} يحقق في {crime} الغامض في {location}، لكن لا شيء كما يبدو',
        'عندما يُعثر على {evidence} في {scene}، يدرك {character} أن هذه القضية أكبر من المتوقع',
        'سلسلة من {incidents} تقود {character} لاكتشاف سر مظلم حول {target}'
      ]
    },
    placeholders: {
      en: ['character', 'crime', 'location', 'evidence', 'scene', 'incidents', 'target'],
      ar: ['character', 'crime', 'location', 'evidence', 'scene', 'incidents', 'target']
    },
    themes: ['mystery', 'justice', 'truth', 'deduction'],
    mood: 'mysterious',
    icon: 'MagnifyingGlass',
    color: 'bg-blue-500'
  },

  // Science Fiction Templates
  {
    id: 'space-exploration',
    name: 'Space Exploration',
    nameAr: 'استكشاف الفضاء',
    category: 'scifi',
    description: 'Adventures among the stars and distant worlds',
    descriptionAr: 'مغامرات بين النجوم والعوالم البعيدة',
    prompts: {
      en: [
        'Captain {character} and crew discover {anomaly} on planet {world}, leading to first contact with {aliens}',
        'When Earth receives {signal} from {system}, {character} leads the mission to investigate',
        'A malfunction during {mission} strands {character} on {planet} with only {resource} to survive'
      ],
      ar: [
        'الكابتن {character} وطاقمه يكتشفون {anomaly} على كوكب {world}، مما يؤدي إلى أول اتصال مع {aliens}',
        'عندما تتلقى الأرض {signal} من {system}، يقود {character} المهمة للتحقيق',
        'عطل أثناء {mission} يحاصر {character} على {planet} مع {resource} فقط للبقاء'
      ]
    },
    placeholders: {
      en: ['character', 'anomaly', 'world', 'aliens', 'signal', 'system', 'mission', 'planet', 'resource'],
      ar: ['character', 'anomaly', 'world', 'aliens', 'signal', 'system', 'mission', 'planet', 'resource']
    },
    themes: ['exploration', 'technology', 'humanity', 'survival'],
    mood: 'adventurous',
    icon: 'Rocket',
    color: 'bg-cyan-500'
  },

  // Horror Templates
  {
    id: 'haunted-place',
    name: 'Haunted Place',
    nameAr: 'المكان المسكون',
    category: 'horror',
    description: 'Spine-chilling encounters with the supernatural',
    descriptionAr: 'لقاءات مرعبة مع الخارق للطبيعة',
    prompts: {
      en: [
        '{character} inherits {property} but discovers it\'s haunted by {spirit} seeking {goal}',
        'Strange {phenomena} begin occurring when {character} moves to {location}',
        'During a visit to {place}, {character} awakens something that should have stayed buried'
      ],
      ar: [
        '{character} يرث {property} لكنه يكتشف أنه مسكون بـ{spirit} يسعى لـ{goal}',
        '{phenomena} غريبة تبدأ بالحدوث عندما ينتقل {character} إلى {location}',
        'أثناء زيارة {place}، يوقظ {character} شيئاً كان يجب أن يبقى مدفوناً'
      ]
    },
    placeholders: {
      en: ['character', 'property', 'spirit', 'goal', 'phenomena', 'location', 'place'],
      ar: ['character', 'property', 'spirit', 'goal', 'phenomena', 'location', 'place']
    },
    themes: ['fear', 'supernatural', 'past', 'redemption'],
    mood: 'dark',
    icon: 'Ghost',
    color: 'bg-gray-600'
  },

  // Children's Templates
  {
    id: 'friendship-lesson',
    name: 'Friendship Lesson',
    nameAr: 'درس الصداقة',
    category: 'children',
    description: 'Heartwarming stories about friendship and growing up',
    descriptionAr: 'قصص مؤثرة عن الصداقة والنمو',
    prompts: {
      en: [
        'Little {character} learns about {lesson} when they help {friend} with {problem}',
        'When {character} makes a mistake with {friend}, they discover the importance of {value}',
        '{character} and {friend} go on an adventure to {place} and learn about {theme}'
      ],
      ar: [
        'الصغير {character} يتعلم عن {lesson} عندما يساعد {friend} مع {problem}',
        'عندما يرتكب {character} خطأ مع {friend}، يكتشف أهمية {value}',
        '{character} و{friend} يذهبان في مغامرة إلى {place} ويتعلمان عن {theme}'
      ]
    },
    placeholders: {
      en: ['character', 'lesson', 'friend', 'problem', 'value', 'place', 'theme'],
      ar: ['character', 'lesson', 'friend', 'problem', 'value', 'place', 'theme']
    },
    themes: ['friendship', 'kindness', 'sharing', 'growing up'],
    mood: 'light',
    icon: 'Smiley',
    color: 'bg-green-500'
  }
]

export const storyOccasions: StoryOccasion[] = [
  {
    id: 'bedtime',
    name: 'Bedtime Stories',
    nameAr: 'قصص وقت النوم',
    description: 'Gentle, calming stories perfect for ending the day',
    descriptionAr: 'قصص لطيفة ومهدئة مثالية لإنهاء اليوم',
    templates: ['friendship-lesson', 'magical-world'],
    icon: 'Moon',
    color: 'bg-indigo-500'
  },
  {
    id: 'holiday',
    name: 'Holiday Celebrations',
    nameAr: 'احتفالات العطل',
    description: 'Festive stories for special occasions and holidays',
    descriptionAr: 'قصص احتفالية للمناسبات الخاصة والعطل',
    templates: ['friendship-lesson', 'unexpected-love', 'treasure-hunt'],
    icon: 'GiftBox',
    color: 'bg-red-500'
  },
  {
    id: 'educational',
    name: 'Educational Stories',
    nameAr: 'القصص التعليمية',
    description: 'Stories that teach valuable lessons and morals',
    descriptionAr: 'قصص تعلم دروساً وأخلاقاً قيمة',
    templates: ['friendship-lesson', 'hero-journey'],
    icon: 'BookOpen',
    color: 'bg-blue-500'
  },
  {
    id: 'adventure-time',
    name: 'Adventure Time',
    nameAr: 'وقت المغامرة',
    description: 'Exciting adventures for thrill-seekers',
    descriptionAr: 'مغامرات مثيرة لعشاق الإثارة',
    templates: ['hero-journey', 'treasure-hunt', 'space-exploration'],
    icon: 'Compass',
    color: 'bg-orange-500'
  },
  {
    id: 'romantic-evening',
    name: 'Romantic Evening',
    nameAr: 'أمسية رومانسية',
    description: 'Love stories perfect for romantic moments',
    descriptionAr: 'قصص حب مثالية للحظات الرومانسية',
    templates: ['unexpected-love'],
    icon: 'Heart',
    color: 'bg-pink-500'
  },
  {
    id: 'spooky-night',
    name: 'Spooky Night',
    nameAr: 'ليلة مخيفة',
    description: 'Thrilling stories for those who love a good scare',
    descriptionAr: 'قصص مثيرة لمن يحبون الخوف الجيد',
    templates: ['haunted-place', 'detective-case'],
    icon: 'Ghost',
    color: 'bg-gray-700'
  }
]

export const getTemplatesByCategory = (category: string): StoryTemplate[] => {
  return storyTemplates.filter(template => template.category === category)
}

export const getTemplateById = (id: string): StoryTemplate | undefined => {
  return storyTemplates.find(template => template.id === id)
}

export const getOccasionById = (id: string): StoryOccasion | undefined => {
  return storyOccasions.find(occasion => occasion.id === id)
}