import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Trash, Eye, Play, MagnifyingGlass, Calendar, FolderOpen, Tag, ArrowRight } from '@phosphor-icons/react'
import { Story, Collection, Category } from '../App'
import { SmartRecommendations } from './SmartRecommendations'
import { StoryContinuation } from './StoryContinuation'

interface StoryHistoryProps {
  stories: Story[]
  collections: Collection[]
  categories: Category[]
  selectedStory: Story | null
  onSelectStory: (story: Story | null) => void
  onDeleteStory: (storyId: string) => void
  onContinueStory: (story: Story) => void
  onAddToCollection: (storyId: string, collectionId: string) => void
  onRemoveFromCollection: (storyId: string) => void
  onUpdateCategory: (storyId: string, categoryId: string) => void
  onCreateCollection: (name: string, description: string, color: string) => Collection
  onStoryGenerated: (story: Story) => void
}

export function StoryHistory({ 
  stories, 
  collections,
  categories,
  selectedStory, 
  onSelectStory, 
  onDeleteStory, 
  onContinueStory,
  onAddToCollection,
  onRemoveFromCollection,
  onUpdateCategory,
  onCreateCollection,
  onStoryGenerated
}: StoryHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'ar' | 'en'>('all')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string>('all')
  const [highlightedStories, setHighlightedStories] = useState<Story[]>([])
  const [showContinuation, setShowContinuation] = useState<Story | null>(null)

  const handleViewSimilarStories = (stories: Story[]) => {
    setHighlightedStories(stories)
    // Clear highlights after a few seconds
    setTimeout(() => setHighlightedStories([]), 5000)
  }

  const filteredStories = stories.filter(story => {
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLanguage = selectedLanguage === 'all' || story.language === selectedLanguage
    
    const matchesCategory = selectedCategoryFilter === 'all' || 
      (selectedCategoryFilter === 'uncategorized' ? !story.categoryId : story.categoryId === selectedCategoryFilter)
    
    const matchesCollection = selectedCollectionFilter === 'all' || 
      (selectedCollectionFilter === 'unorganized' ? !story.collectionId : story.collectionId === selectedCollectionFilter)
    
    return matchesSearch && matchesLanguage && matchesCategory && matchesCollection
  })

  const getCollectionName = (collectionId?: string) => {
    return collections.find(c => c.id === collectionId)?.name || 'No Collection'
  }

  const getCategoryName = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized'
  }

  const getCollectionColor = (collectionId?: string) => {
    return collections.find(c => c.id === collectionId)?.color || 'bg-gray-500'
  }

  const getCategoryColor = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId)?.color || 'bg-gray-500'
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStoryPreview = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
        <p className="text-muted-foreground mb-6">
          Start creating your first story to see it here!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedLanguage === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedLanguage === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage('en')}
                >
                  English
                </Button>
                <Button
                  variant={selectedLanguage === 'ar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage('ar')}
                >
                  العربية
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4" />
                  Filter by Category
                </div>
                <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
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
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FolderOpen className="w-4 h-4" />
                  Filter by Collection
                </div>
                <Select value={selectedCollectionFilter} onValueChange={setSelectedCollectionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Collections</SelectItem>
                    <SelectItem value="unorganized">Unorganized</SelectItem>
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
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            {filteredStories.length} of {stories.length} stories
            {highlightedStories.length > 0 && (
              <span className="ml-2 text-primary">
                • {highlightedStories.length} similar stories highlighted
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Stories Grid */}
        <div className={`space-y-4 ${selectedStory ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredStories.map((story) => {
              const isHighlighted = highlightedStories.some(h => h.id === story.id)
              return (
                <Card 
                  key={story.id} 
                  className={`group hover:shadow-md transition-all cursor-pointer ${
                    isHighlighted ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                  } ${selectedStory?.id === story.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => onSelectStory(story)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {story.title}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0 ml-2">
                        {story.language === 'ar' ? 'ع' : 'EN'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(story.createdAt)}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {story.categoryId && (
                          <Badge variant="outline" className="text-xs">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getCategoryColor(story.categoryId)}`} />
                              {getCategoryName(story.categoryId)}
                            </div>
                          </Badge>
                        )}
                        
                        {story.collectionId && (
                          <Badge variant="outline" className="text-xs">
                            <div className="flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" />
                              {getCollectionName(story.collectionId)}
                            </div>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p 
                      className="text-sm text-muted-foreground line-clamp-3"
                      dir={story.language === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {getStoryPreview(story.content)}
                    </p>
                    
                    {story.themes && story.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {story.themes.slice(0, 3).map(theme => (
                          <Badge key={theme} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                        {story.themes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{story.themes.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={(e) => e.stopPropagation()}>
                            <Eye className="w-3 h-3" />
                            Read
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle className="text-xl">{story.title}</DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {story.language === 'ar' ? 'العربية' : 'English'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(story.createdAt)}
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
                              <div className="space-y-2">
                                <div className="text-sm font-medium flex items-center gap-2">
                                  <Tag className="w-4 h-4" />
                                  Category
                                </div>
                                <Select 
                                  value={story.categoryId || ''} 
                                  onValueChange={(value) => onUpdateCategory(story.id, value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">No Category</SelectItem>
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
                                <div className="text-sm font-medium flex items-center gap-2">
                                  <FolderOpen className="w-4 h-4" />
                                  Collection
                                </div>
                                <Select 
                                  value={story.collectionId || ''} 
                                  onValueChange={(value) => {
                                    if (value) {
                                      onAddToCollection(story.id, value)
                                    } else {
                                      onRemoveFromCollection(story.id)
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select collection" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">No Collection</SelectItem>
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
                          </DialogHeader>
                          
                          <ScrollArea className="max-h-96 pr-4">
                            <div 
                              className="story-text whitespace-pre-wrap"
                              dir={story.language === 'ar' ? 'rtl' : 'ltr'}
                            >
                              {story.content}
                            </div>
                          </ScrollArea>
                          
                          <div className="flex gap-2 pt-4 border-t">
                            <Button 
                              onClick={() => setShowContinuation(story)}
                              className="gap-2"
                            >
                              <ArrowRight className="w-4 h-4" />
                              {story.language === 'ar' ? 'متابعة القصة' : 'Continue Story'}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => onDeleteStory(story.id)}
                              className="gap-1"
                            >
                              <Trash className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowContinuation(story)
                        }}
                        className="gap-1"
                        title={story.language === 'ar' ? 'متابعة القصة' : 'Continue Story'}
                      >
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteStory(story.id)
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {filteredStories.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <MagnifyingGlass className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No stories found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or language filter
              </p>
            </div>
          )}
        </div>

        {/* Smart Recommendations Sidebar */}
        {selectedStory && (
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <SmartRecommendations
                currentStory={selectedStory}
                stories={stories}
                collections={collections}
                categories={categories}
                onCreateCollection={onCreateCollection}
                onAddToCollection={onAddToCollection}
                onViewStories={handleViewSimilarStories}
              />
            </div>
          </div>
        )}
      </div>

      {/* Story Continuation Dialog */}
      {showContinuation && (
        <Dialog open={!!showContinuation} onOpenChange={() => setShowContinuation(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <ScrollArea className="max-h-[85vh] pr-4">
              <StoryContinuation
                baseStory={showContinuation}
                onContinuationGenerated={(continuation) => {
                  onStoryGenerated(continuation)
                  setShowContinuation(null)
                }}
                onClose={() => setShowContinuation(null)}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}