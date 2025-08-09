import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Lightbulb, 
  FolderPlus, 
  Sparkles, 
  TrendUp,
  X,
  FolderOpen,
  Plus,
  BookOpen
} from '@phosphor-icons/react'
import { Story, Collection, Category } from '../App'
import { toast } from 'sonner'

interface SmartRecommendation {
  type: 'new_collection' | 'existing_collection' | 'similar_stories'
  title: string
  description: string
  confidence: number
  suggestedName?: string
  suggestedDescription?: string
  suggestedColor?: string
  relatedStories?: Story[]
  targetCollection?: Collection
  reasoning?: string
}

interface SmartRecommendationsProps {
  currentStory: Story | null
  stories: Story[]
  collections: Collection[]
  categories: Category[]
  onCreateCollection: (name: string, description: string, color: string) => Collection
  onAddToCollection: (storyId: string, collectionId: string) => void
  onViewStories: (stories: Story[]) => void
}

export function SmartRecommendations({
  currentStory,
  stories,
  collections,
  categories,
  onCreateCollection,
  onAddToCollection,
  onViewStories
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [newCollectionColor, setNewCollectionColor] = useState('bg-blue-500')
  const [selectedRecommendation, setSelectedRecommendation] = useState<SmartRecommendation | null>(null)

  const colorOptions = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'
  ]

  useEffect(() => {
    if (currentStory && stories.length > 0) {
      generateRecommendations()
    }
  }, [currentStory, stories, collections])

  const generateRecommendations = async () => {
    if (!currentStory) return

    setIsAnalyzing(true)
    try {
      const recs = await analyzeStoryForRecommendations(currentStory, stories, collections)
      setRecommendations(recs)
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeStoryForRecommendations = async (
    story: Story, 
    allStories: Story[], 
    existingCollections: Collection[]
  ): Promise<SmartRecommendation[]> => {
    const recommendations: SmartRecommendation[] = []

    // Find similar stories based on themes, content, and language
    const similarStories = findSimilarStories(story, allStories)
    
    // Check if story should be added to existing collections
    const collectionMatches = findCollectionMatches(story, existingCollections, allStories)
    
    // Generate new collection suggestions using AI
    const newCollectionSuggestions = await generateNewCollectionSuggestions(story, similarStories)

    // Add existing collection recommendations
    collectionMatches.forEach(match => {
      recommendations.push({
        type: 'existing_collection',
        title: `Add to "${match.collection.name}"`,
        description: `This story shares themes with ${match.sharedStories} other stories in this collection`,
        confidence: match.confidence,
        targetCollection: match.collection,
        reasoning: match.reasoning
      })
    })

    // Add new collection recommendations
    newCollectionSuggestions.forEach(suggestion => {
      recommendations.push({
        type: 'new_collection',
        title: suggestion.title,
        description: suggestion.description,
        confidence: suggestion.confidence,
        suggestedName: suggestion.suggestedName,
        suggestedDescription: suggestion.suggestedDescription,
        suggestedColor: suggestion.suggestedColor,
        relatedStories: suggestion.relatedStories,
        reasoning: suggestion.reasoning
      })
    })

    // Add similar stories recommendation
    if (similarStories.length > 1) {
      recommendations.push({
        type: 'similar_stories',
        title: `${similarStories.length} Similar Stories Found`,
        description: `Stories that share themes, style, or characters with "${story.title}"`,
        confidence: 85,
        relatedStories: similarStories,
        reasoning: 'Based on content similarity and shared themes'
      })
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence)
  }

  const findSimilarStories = (targetStory: Story, allStories: Story[]): Story[] => {
    return allStories.filter(story => {
      if (story.id === targetStory.id) return false
      
      let similarity = 0
      
      // Language match
      if (story.language === targetStory.language) similarity += 20
      
      // Theme overlap
      const sharedThemes = story.themes?.filter(theme => 
        targetStory.themes?.includes(theme)
      ) || []
      similarity += sharedThemes.length * 15
      
      // Category match
      if (story.categoryId === targetStory.categoryId && story.categoryId) similarity += 25
      
      // Character overlap (simple name matching)
      const sharedCharacters = story.characters?.filter(char => 
        targetStory.characters?.some(tc => tc.toLowerCase() === char.toLowerCase())
      ) || []
      similarity += sharedCharacters.length * 10
      
      // Content similarity (basic keyword matching)
      const targetWords = targetStory.content.toLowerCase().split(/\s+/)
      const storyWords = story.content.toLowerCase().split(/\s+/)
      const commonWords = targetWords.filter(word => 
        word.length > 4 && storyWords.includes(word)
      )
      similarity += Math.min(commonWords.length * 2, 20)
      
      return similarity > 30
    }).sort((a, b) => {
      // Calculate similarity scores for sorting
      const aScore = calculateSimilarityScore(targetStory, a)
      const bScore = calculateSimilarityScore(targetStory, b)
      return bScore - aScore
    })
  }

  const calculateSimilarityScore = (story1: Story, story2: Story): number => {
    let score = 0
    if (story1.language === story2.language) score += 20
    const sharedThemes = story1.themes?.filter(t => story2.themes?.includes(t)) || []
    score += sharedThemes.length * 15
    if (story1.categoryId === story2.categoryId && story1.categoryId) score += 25
    return score
  }

  const findCollectionMatches = (
    story: Story, 
    collections: Collection[], 
    allStories: Story[]
  ): Array<{collection: Collection, confidence: number, sharedStories: number, reasoning: string}> => {
    return collections.map(collection => {
      const collectionStories = allStories.filter(s => s.collectionId === collection.id)
      if (collectionStories.length === 0) return null
      
      let confidence = 0
      let matchReasons: string[] = []
      
      // Language consistency
      const languageConsistency = collectionStories.every(s => s.language === story.language)
      if (languageConsistency) {
        confidence += 30
        matchReasons.push('language consistency')
      }
      
      // Theme overlap
      const collectionThemes = [...new Set(collectionStories.flatMap(s => s.themes || []))]
      const sharedThemes = story.themes?.filter(theme => collectionThemes.includes(theme)) || []
      confidence += sharedThemes.length * 20
      if (sharedThemes.length > 0) {
        matchReasons.push(`shared themes: ${sharedThemes.join(', ')}`)
      }
      
      // Category match
      const collectionCategories = [...new Set(collectionStories.map(s => s.categoryId).filter(Boolean))]
      if (story.categoryId && collectionCategories.includes(story.categoryId)) {
        confidence += 25
        matchReasons.push('category match')
      }
      
      return confidence > 40 ? {
        collection,
        confidence: Math.min(confidence, 95),
        sharedStories: collectionStories.length,
        reasoning: matchReasons.join(', ')
      } : null
    }).filter(Boolean) as Array<{collection: Collection, confidence: number, sharedStories: number, reasoning: string}>
  }

  const generateNewCollectionSuggestions = async (
    story: Story, 
    similarStories: Story[]
  ): Promise<SmartRecommendation[]> => {
    if (similarStories.length < 2) return []

    try {
      const prompt = spark.llmPrompt`Analyze these stories and suggest smart collection ideas:

Main Story: "${story.title}"
Themes: ${story.themes?.join(', ') || 'None'}
Language: ${story.language}

Similar Stories: ${similarStories.map(s => `"${s.title}" (themes: ${s.themes?.join(', ') || 'none'})`).join(', ')}

Based on this analysis, suggest 1-2 meaningful collection names that would group these stories together. Focus on:
- Common themes and genres
- Narrative style or tone
- Character types or settings
- Cultural or linguistic elements

For each suggestion, provide:
1. Collection name (concise, engaging)
2. Description (1-2 sentences explaining why these stories belong together)
3. Confidence level (1-100)

Format as JSON array:
[{
  "name": "Collection Name",
  "description": "Why these stories belong together",
  "confidence": 85,
  "reasoning": "What makes this grouping meaningful"
}]`

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const suggestions = JSON.parse(response)

      return suggestions.map((suggestion: any) => ({
        type: 'new_collection' as const,
        title: `Create "${suggestion.name}" Collection`,
        description: suggestion.description,
        confidence: suggestion.confidence,
        suggestedName: suggestion.name,
        suggestedDescription: suggestion.description,
        suggestedColor: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        relatedStories: [story, ...similarStories.slice(0, 4)],
        reasoning: suggestion.reasoning
      }))
    } catch (error) {
      console.error('Error generating collection suggestions:', error)
      return []
    }
  }

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name')
      return
    }

    const collection = onCreateCollection(
      newCollectionName,
      newCollectionDescription,
      newCollectionColor
    )

    // Add current story and related stories to the new collection
    if (currentStory) {
      onAddToCollection(currentStory.id, collection.id)
    }

    if (selectedRecommendation?.relatedStories) {
      selectedRecommendation.relatedStories.forEach(story => {
        if (story.id !== currentStory?.id) {
          onAddToCollection(story.id, collection.id)
        }
      })
    }

    setShowCreateDialog(false)
    setNewCollectionName('')
    setNewCollectionDescription('')
    setNewCollectionColor('bg-blue-500')
    setSelectedRecommendation(null)
    toast.success('Collection created and stories added!')
  }

  const openCreateDialog = (recommendation: SmartRecommendation) => {
    setSelectedRecommendation(recommendation)
    setNewCollectionName(recommendation.suggestedName || '')
    setNewCollectionDescription(recommendation.suggestedDescription || '')
    setNewCollectionColor(recommendation.suggestedColor || 'bg-blue-500')
    setShowCreateDialog(true)
  }

  if (!currentStory) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Smart Recommendations
          {isAnalyzing && <Sparkles className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="w-8 h-8 animate-spin mx-auto mb-2" />
            Analyzing story for smart recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No recommendations available. Create more stories to get smart suggestions!
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        <TrendUp className="w-3 h-3 mr-1" />
                        {rec.confidence}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    {rec.reasoning && (
                      <p className="text-xs text-muted-foreground italic">
                        Reason: {rec.reasoning}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  {rec.type === 'existing_collection' && rec.targetCollection && (
                    <Button
                      size="sm"
                      onClick={() => onAddToCollection(currentStory.id, rec.targetCollection!.id)}
                      className="gap-1"
                    >
                      <FolderOpen className="w-3 h-3" />
                      Add to Collection
                    </Button>
                  )}
                  
                  {rec.type === 'new_collection' && (
                    <Button
                      size="sm"
                      onClick={() => openCreateDialog(rec)}
                      className="gap-1"
                    >
                      <FolderPlus className="w-3 h-3" />
                      Create Collection
                    </Button>
                  )}
                  
                  {rec.type === 'similar_stories' && rec.relatedStories && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewStories(rec.relatedStories!)}
                      className="gap-1"
                    >
                      View Stories ({rec.relatedStories.length})
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input
                  id="collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Enter collection name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collection-description">Description (Optional)</Label>
                <Textarea
                  id="collection-description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection"
                  className="min-h-16"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCollectionColor(color)}
                      className={`w-6 h-6 rounded-full ${color} border-2 ${
                        newCollectionColor === color ? 'border-foreground' : 'border-border'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {selectedRecommendation?.relatedStories && (
                <div className="space-y-2">
                  <Label>Stories to Include</Label>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {selectedRecommendation.relatedStories.map(story => (
                      <div key={story.id} className="flex items-center gap-2">
                        <Plus className="w-3 h-3" />
                        {story.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreateCollection} className="flex-1">
                  Create Collection
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}