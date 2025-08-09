import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sparkle, MagicWand, Translate, FolderOpen, Tag, BookOpen, FileText, ChevronDown } from '@phosphor-icons/react'
import { Story, StoryContext, Collection, Category } from '../App'
import { SmartRecommendations } from './SmartRecommendations'
import { StoryTemplates } from './StoryTemplates'
import { type StoryTemplate } from '../data/storyTemplates'
import { spark } from '../lib/mockStoryGenerator'
import { toast } from 'sonner'

interface StoryGeneratorProps {
  onStoryGenerated: (story: Story) => void
  context: StoryContext
  recentStories: Story[]
  collections: Collection[]
  categories: Category[]
  onCreateCollection: (name: string, description: string, color: string) => Collection
  onAddToCollection: (storyId: string, collectionId: string) => void
}

export function StoryGenerator({ 
  onStoryGenerated, 
  context, 
  recentStories, 
  collections, 
  categories,
  onCreateCollection,
  onAddToCollection
}: StoryGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showRecommendations, setShowRecommendations] = useState(false)

  const detectLanguage = (text: string): 'ar' | 'en' => {
    const arabicRegex = /[\u0600-\u06FF]/
    return arabicRegex.test(text) ? 'ar' : 'en'
  }

  const generateStory = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a story prompt')
      return
    }

    setIsGenerating(true)
    try {
      const language = detectLanguage(prompt)
      const isArabic = language === 'ar'
      
      // Build context for the AI
      const contextPrompt = buildContextPrompt(prompt, language, context, recentStories)
      
      const storyPrompt = spark.llmPrompt`${contextPrompt}`
      const generatedContent = await spark.llm(storyPrompt, 'gpt-4o')
      
      // Extract story components
      const storyLines = generatedContent.split('\n').filter(line => line.trim())
      const title = storyLines[0]?.replace(/^(Title:|العنوان:)\s*/i, '') || (isArabic ? 'قصة جديدة' : 'New Story')
      const content = storyLines.slice(1).join('\n\n')
      
      const newStory: Story = {
        id: Date.now().toString(),
        title,
        content,
        prompt,
        language,
        createdAt: Date.now(),
        characters: extractCharacters(content),
        themes: extractThemes(content, language),
        collectionId: selectedCollection && selectedCollection !== 'none' ? selectedCollection : undefined,
        categoryId: selectedCategory && selectedCategory !== 'none' ? selectedCategory : undefined
      }
      
      setGeneratedStory(newStory)
      setShowRecommendations(true)
    } catch (error) {
      console.error('Error generating story:', error)
      toast.error('Failed to generate story. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const buildContextPrompt = (userPrompt: string, language: 'ar' | 'en', context: StoryContext, recentStories: Story[]) => {
    const isArabic = language === 'ar'
    
    let contextString = ''
    
    // Add character context
    const characterNames = Object.keys(context.characters)
    if (characterNames.length > 0) {
      contextString += isArabic 
        ? `الشخصيات المعروفة: ${characterNames.join(', ')}\n`
        : `Known characters: ${characterNames.join(', ')}\n`
    }
    
    // Add recent themes
    if (context.themes.length > 0) {
      contextString += isArabic
        ? `المواضيع السابقة: ${context.themes.slice(0, 5).join(', ')}\n`
        : `Previous themes: ${context.themes.slice(0, 5).join(', ')}\n`
    }
    
    const basePrompt = isArabic
      ? `أنت راوي قصص ذكي ومبدع. اكتب قصة جميلة ومثيرة باللغة العربية بناءً على الطلب التالي.

${contextString}

الطلب: ${userPrompt}

تعليمات:
- اكتب قصة كاملة ومثيرة للاهتمام
- استخدم وصفاً حيوياً وشخصيات مقنعة
- اجعل القصة بطول مناسب (300-800 كلمة)
- ابدأ بعنوان جذاب
- استخدم أسلوباً أدبياً جميلاً

العنوان: [عنوان القصة]
[محتوى القصة]`
      : `You are an intelligent and creative storyteller. Write a beautiful and engaging story in English based on the following prompt.

${contextString}

Prompt: ${userPrompt}

Instructions:
- Write a complete and engaging story
- Use vivid descriptions and compelling characters
- Make the story an appropriate length (300-800 words)
- Start with an engaging title
- Use beautiful literary style

Title: [Story Title]
[Story Content]`
    
    return basePrompt
  }

  const extractCharacters = (content: string): string[] => {
    // Simple character extraction - could be enhanced with NLP
    const words = content.split(/\s+/)
    const possibleNames = words.filter(word => 
      /^[A-Z][a-z]+$/.test(word) || /^[\u0600-\u06FF]+$/.test(word)
    )
    return [...new Set(possibleNames)].slice(0, 5)
  }

  const extractThemes = (content: string, language: 'ar' | 'en'): string[] => {
    // Simple theme extraction based on common keywords
    const themes: string[] = []
    const lowerContent = content.toLowerCase()
    
    const themeKeywords = language === 'ar' 
      ? [
          { keywords: ['حب', 'غرام', 'عشق'], theme: 'حب' },
          { keywords: ['مغامرة', 'رحلة', 'استكشاف'], theme: 'مغامرة' },
          { keywords: ['سحر', 'جن', 'خيال'], theme: 'خيال' },
          { keywords: ['حرب', 'معركة', 'قتال'], theme: 'حرب' },
          { keywords: ['صداقة', 'أصدقاء'], theme: 'صداقة' }
        ]
      : [
          { keywords: ['love', 'romance', 'heart'], theme: 'Romance' },
          { keywords: ['adventure', 'journey', 'quest'], theme: 'Adventure' },
          { keywords: ['magic', 'wizard', 'fantasy'], theme: 'Fantasy' },
          { keywords: ['war', 'battle', 'fight'], theme: 'War' },
          { keywords: ['friendship', 'friends'], theme: 'Friendship' }
        ]
    
    themeKeywords.forEach(({ keywords, theme }) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        themes.push(theme)
      }
    })
    
    return themes
  }

  const saveStory = () => {
    if (generatedStory) {
      onStoryGenerated(generatedStory)
      setGeneratedStory(null)
      setPrompt('')
      setShowRecommendations(false)
    }
  }

  const generateNewStory = () => {
    setGeneratedStory(null)
    setShowRecommendations(false)
  }

  return (
    <div className="space-y-6">
      <div className={`grid gap-6 ${generatedStory && showRecommendations ? 'lg:grid-cols-12' : ''}`}>
        {/* Main Story Generation Section */}
        <div className={`space-y-6 ${generatedStory && showRecommendations ? 'lg:col-span-8' : ''}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MagicWand className="w-5 h-5 text-primary" />
                Create Your Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="story-prompt" className="text-sm font-medium text-foreground">
                  Story Prompt
                </label>
                <Textarea
                  id="story-prompt"
                  placeholder="Enter your story idea in English or Arabic... / أدخل فكرة قصتك بالعربية أو الإنجليزية..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24 resize-none"
                  dir="auto"
                />
              </div>
              
              {prompt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Translate className="w-4 h-4" />
                  Detected language: {detectLanguage(prompt) === 'ar' ? 'Arabic العربية' : 'English'}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-select" className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Category (Optional)
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category-select">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${category.color}`} />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection-select" className="text-sm font-medium flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Collection (Optional)
                  </Label>
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger id="collection-select">
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Collection</SelectItem>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${collection.color}`} />
                            {collection.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={generateStory} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkle className="w-4 h-4 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  <>
                    <Sparkle className="w-4 h-4" />
                    Generate Story
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Context hints */}
          {(context.themes.length > 0 || Object.keys(context.characters).length > 0) && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Story Context</h3>
                <div className="flex flex-wrap gap-2">
                  {context.themes.slice(0, 5).map(theme => (
                    <Badge key={theme} variant="secondary" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                  {Object.keys(context.characters).slice(0, 3).map(char => (
                    <Badge key={char} variant="outline" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated story display */}
          {generatedStory && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{generatedStory.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {generatedStory.language === 'ar' ? 'العربية' : 'English'}
                      </Badge>
                      {generatedStory.themes?.map(theme => (
                        <Badge key={theme} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="story-text whitespace-pre-wrap text-foreground"
                  dir={generatedStory.language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {generatedStory.content}
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={saveStory} className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Save Story
                  </Button>
                  <Button variant="outline" onClick={generateNewStory}>
                    Generate Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Smart Recommendations Sidebar */}
        {generatedStory && showRecommendations && (
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <SmartRecommendations
                currentStory={generatedStory}
                stories={recentStories}
                collections={collections}
                categories={categories}
                onCreateCollection={onCreateCollection}
                onAddToCollection={onAddToCollection}
                onViewStories={() => {}} // Not applicable in generator view
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}