import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Sparkles, Template, Calendar, Wand, ArrowRight, Shuffle, Lightbulb } from '@phosphor-icons/react'
import { storyTemplates, storyOccasions, getTemplateById, type StoryTemplate, type StoryOccasion } from '../data/storyTemplates'
import { PromptSuggestions } from './PromptSuggestions'

interface StoryTemplatesProps {
  language: 'ar' | 'en'
  onTemplateSelect: (prompt: string, template: StoryTemplate) => void
  onPromptGenerate: (prompt: string) => void
}

export function StoryTemplates({ language, onTemplateSelect, onPromptGenerate }: StoryTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null)
  const [selectedOccasion, setSelectedOccasion] = useState<StoryOccasion | null>(null)
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('categories')
  const [isCustomizing, setIsCustomizing] = useState(false)

  // Filter templates by category for display
  const templatesByCategory = storyTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, StoryTemplate[]>)

  const generateRandomPrompt = (template: StoryTemplate) => {
    const prompts = template.prompts[language]
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
    
    let filledPrompt = randomPrompt
    
    // Replace placeholders with custom values or random suggestions
    template.placeholders[language].forEach(placeholder => {
      const customValue = customValues[placeholder]
      if (customValue) {
        filledPrompt = filledPrompt.replace(`{${placeholder}}`, customValue)
      } else {
        // Generate random suggestions based on placeholder type
        const suggestion = generateSuggestion(placeholder, language)
        filledPrompt = filledPrompt.replace(`{${placeholder}}`, suggestion)
      }
    })
    
    return filledPrompt
  }

  const generateSuggestion = (placeholder: string, lang: 'ar' | 'en'): string => {
    const suggestions: Record<string, Record<string, string[]>> = {
      character: {
        en: ['Alex', 'Morgan', 'Sam', 'Jordan', 'Casey', 'Riley', 'Taylor'],
        ar: ['أحمد', 'فاطمة', 'محمد', 'عائشة', 'علي', 'خديجة', 'يوسف']
      },
      place: {
        en: ['ancient forest', 'mysterious castle', 'hidden valley', 'distant planet', 'magical realm'],
        ar: ['الغابة القديمة', 'القلعة الغامضة', 'الوادي المخفي', 'الكوكب البعيد', 'المملكة السحرية']
      },
      power: {
        en: ['ability to read minds', 'control over elements', 'power of invisibility', 'time manipulation'],
        ar: ['قدرة قراءة الأفكار', 'السيطرة على العناصر', 'قوة الاختفاء', 'التلاعب بالزمن']
      },
      treasure: {
        en: ['ancient gold coins', 'magical crystals', 'lost crown', 'legendary sword'],
        ar: ['العملات الذهبية القديمة', 'البلورات السحرية', 'التاج المفقود', 'السيف الأسطوري']
      }
    }

    const categoryOptions = suggestions[placeholder] || suggestions.character
    const options = categoryOptions[lang] || categoryOptions.en
    return options[Math.floor(Math.random() * options.length)]
  }

  const handleUseTemplate = (template: StoryTemplate) => {
    setSelectedTemplate(template)
    setIsCustomizing(true)
    
    // Initialize custom values
    const initialValues: Record<string, string> = {}
    template.placeholders[language].forEach(placeholder => {
      initialValues[placeholder] = ''
    })
    setCustomValues(initialValues)
  }

  const handleGenerateFromTemplate = () => {
    if (!selectedTemplate) return
    
    const prompt = generateRandomPrompt(selectedTemplate)
    onTemplateSelect(prompt, selectedTemplate)
    setIsCustomizing(false)
    setSelectedTemplate(null)
    setCustomValues({})
  }

  const handleQuickGenerate = (template: StoryTemplate) => {
    const prompt = generateRandomPrompt(template)
    onTemplateSelect(prompt, template)
  }

  const TemplateCard = ({ template }: { template: StoryTemplate }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${template.color} flex items-center justify-center text-white text-sm`}>
              <Sparkles size={16} />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? template.nameAr : template.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ar' ? template.descriptionAr : template.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {template.themes.slice(0, 3).map(theme => (
            <Badge key={theme} variant="secondary" className="text-xs">
              {theme}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickGenerate(template)}
            className="flex-1"
          >
            <Shuffle size={14} className="mr-1" />
            {language === 'ar' ? 'توليد سريع' : 'Quick Generate'}
          </Button>
          <Button
            size="sm"
            onClick={() => handleUseTemplate(template)}
            className="flex-1"
          >
            <Wand size={14} className="mr-1" />
            {language === 'ar' ? 'تخصيص' : 'Customize'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const OccasionCard = ({ occasion }: { occasion: StoryOccasion }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${occasion.color} flex items-center justify-center text-white`}>
            <Calendar size={20} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? occasion.nameAr : occasion.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'ar' ? occasion.descriptionAr : occasion.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {occasion.templates.slice(0, 3).map(templateId => {
            const template = getTemplateById(templateId)
            if (!template) return null
            
            return (
              <Button
                key={templateId}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickGenerate(template)}
                className="w-full justify-start h-auto p-2"
              >
                <div className="text-left">
                  <div className="font-medium text-xs">
                    {language === 'ar' ? template.nameAr : template.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {template.themes.slice(0, 2).join(', ')}
                  </div>
                </div>
                <ArrowRight size={14} className="ml-auto" />
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Template size={20} className="text-primary" />
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'قوالب القصص' : 'Story Templates'}
        </h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">
            {language === 'ar' ? 'حسب الفئة' : 'By Category'}
          </TabsTrigger>
          <TabsTrigger value="occasions">
            {language === 'ar' ? 'حسب المناسبة' : 'By Occasion'}
          </TabsTrigger>
          <TabsTrigger value="prompts">
            {language === 'ar' ? 'اقتراحات الكتابة' : 'Writing Prompts'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {category === 'adventure' ? (language === 'ar' ? 'مغامرة' : 'Adventure') :
                 category === 'fantasy' ? (language === 'ar' ? 'خيال' : 'Fantasy') :
                 category === 'romance' ? (language === 'ar' ? 'رومانسية' : 'Romance') :
                 category === 'mystery' ? (language === 'ar' ? 'غموض' : 'Mystery') :
                 category === 'scifi' ? (language === 'ar' ? 'خيال علمي' : 'Sci-Fi') :
                 category === 'horror' ? (language === 'ar' ? 'رعب' : 'Horror') :
                 category === 'children' ? (language === 'ar' ? 'أطفال' : 'Children') : category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="occasions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storyOccasions.map(occasion => (
              <OccasionCard key={occasion.id} occasion={occasion} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <PromptSuggestions
            language={language}
            onPromptSelect={onPromptGenerate}
          />
        </TabsContent>
      </Tabs>

      {/* Template Customization Dialog */}
      <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تخصيص القالب' : 'Customize Template'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">
                  {language === 'ar' ? selectedTemplate.nameAr : selectedTemplate.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? selectedTemplate.descriptionAr : selectedTemplate.description}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {language === 'ar' ? 'تخصيص العناصر:' : 'Customize Elements:'}
                </Label>
                
                {selectedTemplate.placeholders[language].map(placeholder => (
                  <div key={placeholder} className="space-y-1">
                    <Label htmlFor={placeholder} className="text-xs text-muted-foreground">
                      {placeholder}
                    </Label>
                    <Input
                      id={placeholder}
                      value={customValues[placeholder] || ''}
                      onChange={(e) => setCustomValues(prev => ({
                        ...prev,
                        [placeholder]: e.target.value
                      }))}
                      placeholder={`Enter ${placeholder}...`}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCustomizing(false)}
                  className="flex-1"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleGenerateFromTemplate}
                  className="flex-1"
                >
                  <Sparkles size={14} className="mr-1" />
                  {language === 'ar' ? 'توليد' : 'Generate'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}