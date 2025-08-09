import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lightbulb, Dice1, Calendar, BookOpen, ArrowRight, Sparkles } from '@phosphor-icons/react'
import { getPromptsByOccasion, getSeasonalPrompts, getRandomPrompt, type PromptSuggestion } from '../data/promptSuggestions'
import { storyOccasions } from '../data/storyTemplates'

interface PromptSuggestionsProps {
  language: 'ar' | 'en'
  onPromptSelect: (prompt: string) => void
}

export function PromptSuggestions({ language, onPromptSelect }: PromptSuggestionsProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')

  const seasonalPrompts = getSeasonalPrompts()
  const occasionPrompts = selectedOccasion ? getPromptsByOccasion(selectedOccasion) : []

  const handleRandomPrompt = () => {
    const randomPrompt = getRandomPrompt(selectedCategory || undefined, selectedDifficulty || undefined)
    const promptText = language === 'ar' ? randomPrompt.promptAr : randomPrompt.prompt
    onPromptSelect(promptText)
  }

  const PromptCard = ({ suggestion }: { suggestion: PromptSuggestion }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {suggestion.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {suggestion.estimatedLength}
              </Badge>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {language === 'ar' ? suggestion.promptAr : suggestion.prompt}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {suggestion.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Button
          size="sm"
          onClick={() => onPromptSelect(language === 'ar' ? suggestion.promptAr : suggestion.prompt)}
          className="w-full"
        >
          <ArrowRight size={14} className="mr-1" />
          {language === 'ar' ? 'استخدم هذا الاقتراح' : 'Use This Prompt'}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb size={20} className="text-primary" />
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'اقتراحات الكتابة' : 'Writing Prompts'}
        </h3>
      </div>

      {/* Random Prompt Generator */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dice1 className="w-5 h-5" />
            {language === 'ar' ? 'مولد الاقتراحات العشوائي' : 'Random Prompt Generator'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'الفئة' : 'Category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
                </SelectItem>
                <SelectItem value="adventure">
                  {language === 'ar' ? 'مغامرة' : 'Adventure'}
                </SelectItem>
                <SelectItem value="romance">
                  {language === 'ar' ? 'رومانسية' : 'Romance'}
                </SelectItem>
                <SelectItem value="fantasy">
                  {language === 'ar' ? 'خيال' : 'Fantasy'}
                </SelectItem>
                <SelectItem value="mystery">
                  {language === 'ar' ? 'غموض' : 'Mystery'}
                </SelectItem>
                <SelectItem value="children">
                  {language === 'ar' ? 'أطفال' : 'Children'}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'المستوى' : 'Difficulty'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {language === 'ar' ? 'جميع المستويات' : 'All Levels'}
                </SelectItem>
                <SelectItem value="beginner">
                  {language === 'ar' ? 'مبتدئ' : 'Beginner'}
                </SelectItem>
                <SelectItem value="intermediate">
                  {language === 'ar' ? 'متوسط' : 'Intermediate'}
                </SelectItem>
                <SelectItem value="advanced">
                  {language === 'ar' ? 'متقدم' : 'Advanced'}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleRandomPrompt} className="gap-2">
              <Sparkles size={16} />
              {language === 'ar' ? 'اقتراح عشوائي' : 'Random Prompt'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Prompts */}
      {seasonalPrompts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Calendar size={16} />
            {language === 'ar' ? 'اقتراحات موسمية' : 'Seasonal Prompts'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasonalPrompts.map(suggestion => (
              <PromptCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Occasion-based Prompts */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          {language === 'ar' ? 'حسب المناسبة' : 'By Occasion'}
        </h4>
        
        <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
          <SelectTrigger>
            <SelectValue placeholder={language === 'ar' ? 'اختر مناسبة' : 'Select an occasion'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              {language === 'ar' ? 'جميع المناسبات' : 'All Occasions'}
            </SelectItem>
            {storyOccasions.map(occasion => (
              <SelectItem key={occasion.id} value={occasion.id}>
                {language === 'ar' ? occasion.nameAr : occasion.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {occasionPrompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {occasionPrompts.map(suggestion => (
              <PromptCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Inspiration */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-5 h-5" />
            {language === 'ar' ? 'نصائح الكتابة' : 'Writing Tips'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              {language === 'ar' 
                ? '• ابدأ بشخصية واضحة وهدف محدد'
                : '• Start with a clear character and specific goal'
              }
            </p>
            <p>
              {language === 'ar'
                ? '• استخدم التفاصيل الحسية لإشراك القارئ'
                : '• Use sensory details to engage the reader'
              }
            </p>
            <p>
              {language === 'ar'
                ? '• اجعل كل جملة تدفع القصة إلى الأمام'
                : '• Make every sentence move the story forward'
              }
            </p>
            <p>
              {language === 'ar'
                ? '• لا تخف من المشاعر والصراعات الداخلية'
                : '• Don\'t be afraid of emotions and internal conflicts'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}