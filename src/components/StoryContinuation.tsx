import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, Sparkles, Users, BookmarkSimple, Target, Wand, BookOpen } from '@phosphor-icons/react'
import { Story } from '../App'
import { toast } from 'sonner'

interface ExtractedElement {
  id: string
  text: string
  type: 'character' | 'plotPoint' | 'location' | 'theme'
  selected: boolean
}

interface StoryContinuationProps {
  baseStory: Story
  onContinuationGenerated: (story: Story) => void
  onClose: () => void
}

export function StoryContinuation({ baseStory, onContinuationGenerated, onClose }: StoryContinuationProps) {
  const [extractedElements, setExtractedElements] = useState<ExtractedElement[]>([])
  const [customDirection, setCustomDirection] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExtracting, setIsExtracting] = useState(true)
  const [generatedContinuation, setGeneratedContinuation] = useState<Story | null>(null)

  useEffect(() => {
    extractStoryElements()
  }, [baseStory])

  const extractStoryElements = async () => {
    setIsExtracting(true)
    try {
      const isArabic = baseStory.language === 'ar'
      
      const extractionPrompt = spark.llmPrompt`${buildExtractionPrompt(baseStory.content, isArabic)}`
      const extractionResult = await spark.llm(extractionPrompt, 'gpt-4o', true)
      
      const parsed = JSON.parse(extractionResult)
      const elements: ExtractedElement[] = []
      
      // Add characters
      parsed.characters?.forEach((char: string, index: number) => {
        elements.push({
          id: `char-${index}`,
          text: char,
          type: 'character',
          selected: true
        })
      })
      
      // Add plot points
      parsed.plotPoints?.forEach((plot: string, index: number) => {
        elements.push({
          id: `plot-${index}`,
          text: plot,
          type: 'plotPoint',
          selected: true
        })
      })
      
      // Add locations
      parsed.locations?.forEach((loc: string, index: number) => {
        elements.push({
          id: `loc-${index}`,
          text: loc,
          type: 'location',
          selected: true
        })
      })
      
      // Add themes
      parsed.themes?.forEach((theme: string, index: number) => {
        elements.push({
          id: `theme-${index}`,
          text: theme,
          type: 'theme',
          selected: true
        })
      })
      
      setExtractedElements(elements)
    } catch (error) {
      console.error('Error extracting story elements:', error)
      toast.error(baseStory.language === 'ar' 
        ? 'فشل في استخراج عناصر القصة' 
        : 'Failed to extract story elements'
      )
      // Fallback: create basic elements from the story
      const basicElements = createBasicElements(baseStory)
      setExtractedElements(basicElements)
    } finally {
      setIsExtracting(false)
    }
  }

  const buildExtractionPrompt = (content: string, isArabic: boolean) => {
    return isArabic
      ? `قم بتحليل النص التالي واستخراج العناصر المهمة للقصة. أعطني النتيجة في صيغة JSON بالشكل المحدد:

النص: ${content}

يجب أن تكون النتيجة بالصيغة التالية:
{
  "characters": ["قائمة بأسماء الشخصيات الرئيسية"],
  "plotPoints": ["النقاط المهمة في الحبكة"],
  "locations": ["الأماكن المذكورة"],
  "themes": ["المواضيع والأفكار الرئيسية"]
}

تعليمات:
- استخرج فقط العناصر المهمة والرئيسية
- اقتصر على 3-5 عناصر لكل نوع
- استخدم اللغة العربية`
      : `Analyze the following story text and extract important story elements. Give me the result in JSON format as specified:

Text: ${content}

The result should be in this format:
{
  "characters": ["list of main character names"],
  "plotPoints": ["important plot points"],
  "locations": ["mentioned locations"],
  "themes": ["main themes and ideas"]
}

Instructions:
- Extract only important and main elements
- Limit to 3-5 elements per type
- Use English language`
  }

  const createBasicElements = (story: Story): ExtractedElement[] => {
    // Fallback basic extraction
    const elements: ExtractedElement[] = []
    
    // Extract potential character names (capitalized words)
    const words = story.content.split(/\s+/)
    const potentialCharacters = words
      .filter(word => /^[A-Z][a-z]+$/.test(word) || /^[\u0600-\u06FF]+$/.test(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 5)
    
    potentialCharacters.forEach((char, index) => {
      elements.push({
        id: `char-${index}`,
        text: char,
        type: 'character',
        selected: true
      })
    })
    
    // Add basic themes if available
    if (story.themes) {
      story.themes.forEach((theme, index) => {
        elements.push({
          id: `theme-${index}`,
          text: theme,
          type: 'theme',
          selected: true
        })
      })
    }
    
    return elements
  }

  const toggleElement = (id: string) => {
    setExtractedElements(prev => 
      prev.map(element => 
        element.id === id 
          ? { ...element, selected: !element.selected }
          : element
      )
    )
  }

  const generateContinuation = async () => {
    if (extractedElements.filter(e => e.selected).length === 0 && !customDirection.trim()) {
      toast.error(baseStory.language === 'ar' 
        ? 'يرجى اختيار عناصر أو إضافة توجيه مخصص'
        : 'Please select elements or add custom direction'
      )
      return
    }

    setIsGenerating(true)
    try {
      const selectedElements = extractedElements.filter(e => e.selected)
      const continuationPrompt = buildContinuationPrompt(
        baseStory, 
        selectedElements, 
        customDirection
      )
      
      const storyPrompt = spark.llmPrompt`${continuationPrompt}`
      const generatedContent = await spark.llm(storyPrompt, 'gpt-4o')
      
      // Parse the generated content
      const lines = generatedContent.split('\n').filter(line => line.trim())
      const title = lines[0]?.replace(/^(Title:|العنوان:)\s*/i, '') || 
        (baseStory.language === 'ar' ? `${baseStory.title} - الجزء الثاني` : `${baseStory.title} - Part 2`)
      const content = lines.slice(1).join('\n\n')
      
      const continuation: Story = {
        id: Date.now().toString(),
        title,
        content,
        prompt: `Continuation of: ${baseStory.title}`,
        language: baseStory.language,
        createdAt: Date.now(),
        characters: selectedElements
          .filter(e => e.type === 'character')
          .map(e => e.text)
          .concat(baseStory.characters || []),
        themes: selectedElements
          .filter(e => e.type === 'theme')
          .map(e => e.text)
          .concat(baseStory.themes || []),
        collectionId: baseStory.collectionId,
        categoryId: baseStory.categoryId
      }
      
      setGeneratedContinuation(continuation)
    } catch (error) {
      console.error('Error generating continuation:', error)
      toast.error(baseStory.language === 'ar' 
        ? 'فشل في إنشاء المتابعة'
        : 'Failed to generate continuation'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const buildContinuationPrompt = (
    story: Story, 
    selectedElements: ExtractedElement[], 
    direction: string
  ) => {
    const isArabic = story.language === 'ar'
    
    const characters = selectedElements.filter(e => e.type === 'character').map(e => e.text)
    const plotPoints = selectedElements.filter(e => e.type === 'plotPoint').map(e => e.text)
    const locations = selectedElements.filter(e => e.type === 'location').map(e => e.text)
    const themes = selectedElements.filter(e => e.type === 'theme').map(e => e.text)
    
    return isArabic
      ? `أنت راوي قصص ذكي ومبدع. اكتب تتمة للقصة التالية مع الحفاظ على استمرارية السرد والشخصيات.

القصة الأصلية:
العنوان: ${story.title}
المحتوى: ${story.content}

العناصر المطلوب التركيز عليها:
${characters.length > 0 ? `الشخصيات: ${characters.join(', ')}` : ''}
${plotPoints.length > 0 ? `نقاط الحبكة: ${plotPoints.join(', ')}` : ''}
${locations.length > 0 ? `الأماكن: ${locations.join(', ')}` : ''}
${themes.length > 0 ? `المواضيع: ${themes.join(', ')}` : ''}

${direction ? `التوجيه المخصص: ${direction}` : ''}

تعليمات:
- اكتب تتمة منطقية وطبيعية للقصة
- حافظ على شخصية وأسلوب الشخصيات المذكورة
- طور الأحداث بناءً على ما حدث في القصة الأصلية
- استخدم نفس الأسلوب الأدبي للقصة الأصلية
- اجعل التتمة بطول مناسب (400-600 كلمة)
- ابدأ بعنوان للجزء الجديد

العنوان: [عنوان الجزء الجديد]
[محتوى التتمة]`
      : `You are an intelligent and creative storyteller. Write a continuation for the following story while maintaining narrative continuity and character consistency.

Original Story:
Title: ${story.title}
Content: ${story.content}

Elements to focus on:
${characters.length > 0 ? `Characters: ${characters.join(', ')}` : ''}
${plotPoints.length > 0 ? `Plot Points: ${plotPoints.join(', ')}` : ''}
${locations.length > 0 ? `Locations: ${locations.join(', ')}` : ''}
${themes.length > 0 ? `Themes: ${themes.join(', ')}` : ''}

${direction ? `Custom Direction: ${direction}` : ''}

Instructions:
- Write a logical and natural continuation of the story
- Maintain the personality and style of mentioned characters
- Develop events based on what happened in the original story
- Use the same literary style as the original story
- Make the continuation an appropriate length (400-600 words)
- Start with a title for the new part

Title: [New Part Title]
[Continuation Content]`
  }

  const saveContinuation = () => {
    if (generatedContinuation) {
      onContinuationGenerated(generatedContinuation)
      toast.success(baseStory.language === 'ar' 
        ? 'تم حفظ التتمة بنجاح!'
        : 'Continuation saved successfully!'
      )
      onClose()
    }
  }

  const getElementIcon = (type: ExtractedElement['type']) => {
    switch (type) {
      case 'character': return <Users className="w-4 h-4" />
      case 'plotPoint': return <Target className="w-4 h-4" />
      case 'location': return <BookmarkSimple className="w-4 h-4" />
      case 'theme': return <Sparkles className="w-4 h-4" />
    }
  }

  const getElementColor = (type: ExtractedElement['type']) => {
    switch (type) {
      case 'character': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'plotPoint': return 'bg-green-100 text-green-800 border-green-200'
      case 'location': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'theme': return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  if (isExtracting) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Sparkles className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              {baseStory.language === 'ar' 
                ? 'استخراج عناصر القصة...'
                : 'Extracting story elements...'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            {baseStory.language === 'ar' ? 'متابعة القصة بالذكاء الاصطناعي' : 'AI-Powered Story Continuation'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {baseStory.language === 'ar' 
              ? 'اختر العناصر التي تريد التركيز عليها في التتمة'
              : 'Select elements you want to focus on in the continuation'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original Story Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {baseStory.language === 'ar' ? 'القصة الأصلية' : 'Original Story'}
            </Label>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">{baseStory.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {baseStory.content.substring(0, 200)}...
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Extracted Elements */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {baseStory.language === 'ar' ? 'العناصر المستخرجة' : 'Extracted Elements'}
            </Label>
            
            {extractedElements.length > 0 ? (
              <ScrollArea className="h-64 w-full border rounded-md p-4">
                <div className="space-y-3">
                  {['character', 'plotPoint', 'location', 'theme'].map(type => {
                    const elements = extractedElements.filter(e => e.type === type)
                    if (elements.length === 0) return null
                    
                    return (
                      <div key={type} className="space-y-2">
                        <h4 className="text-sm font-medium capitalize flex items-center gap-2">
                          {getElementIcon(type as ExtractedElement['type'])}
                          {type === 'character' ? (baseStory.language === 'ar' ? 'الشخصيات' : 'Characters') :
                           type === 'plotPoint' ? (baseStory.language === 'ar' ? 'نقاط الحبكة' : 'Plot Points') :
                           type === 'location' ? (baseStory.language === 'ar' ? 'الأماكن' : 'Locations') :
                           (baseStory.language === 'ar' ? 'المواضيع' : 'Themes')}
                        </h4>
                        <div className="space-y-2 ml-6">
                          {elements.map(element => (
                            <div key={element.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={element.id}
                                checked={element.selected}
                                onCheckedChange={() => toggleElement(element.id)}
                              />
                              <Label
                                htmlFor={element.id}
                                className={`text-sm px-2 py-1 rounded-md border cursor-pointer ${getElementColor(element.type)}`}
                              >
                                {element.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {baseStory.language === 'ar' 
                  ? 'لم يتم العثور على عناصر. يمكنك إضافة توجيه مخصص أدناه.'
                  : 'No elements found. You can add custom direction below.'
                }
              </p>
            )}
          </div>

          <Separator />

          {/* Custom Direction */}
          <div className="space-y-2">
            <Label htmlFor="custom-direction" className="text-sm font-medium">
              {baseStory.language === 'ar' ? 'توجيه مخصص (اختياري)' : 'Custom Direction (Optional)'}
            </Label>
            <Textarea
              id="custom-direction"
              placeholder={baseStory.language === 'ar' 
                ? 'أضف أي توجيه محدد لكيفية متابعة القصة...'
                : 'Add any specific direction for how the story should continue...'
              }
              value={customDirection}
              onChange={(e) => setCustomDirection(e.target.value)}
              className="min-h-20"
              dir="auto"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={generateContinuation} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  {baseStory.language === 'ar' ? 'إنشاء التتمة...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Wand className="w-4 h-4" />
                  {baseStory.language === 'ar' ? 'إنشاء التتمة' : 'Generate Continuation'}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {baseStory.language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Continuation */}
      {generatedContinuation && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedContinuation.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {generatedContinuation.language === 'ar' ? 'العربية' : 'English'}
              </Badge>
              <Badge variant="outline">
                {baseStory.language === 'ar' ? 'تتمة' : 'Continuation'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="story-text whitespace-pre-wrap text-foreground"
              dir={generatedContinuation.language === 'ar' ? 'rtl' : 'ltr'}
            >
              {generatedContinuation.content}
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={saveContinuation} className="gap-2">
                <BookOpen className="w-4 h-4" />
                {baseStory.language === 'ar' ? 'حفظ التتمة' : 'Save Continuation'}
              </Button>
              <Button variant="outline" onClick={() => setGeneratedContinuation(null)}>
                {baseStory.language === 'ar' ? 'إنشاء جديد' : 'Generate New'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}