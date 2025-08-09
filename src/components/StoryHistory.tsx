import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BookOpen, Trash, Eye, Play, MagnifyingGlass, Calendar } from '@phosphor-icons/react'
import { Story } from '../App'

interface StoryHistoryProps {
  stories: Story[]
  selectedStory: Story | null
  onSelectStory: (story: Story | null) => void
  onDeleteStory: (storyId: string) => void
  onContinueStory: (story: Story) => void
}

export function StoryHistory({ 
  stories, 
  selectedStory, 
  onSelectStory, 
  onDeleteStory, 
  onContinueStory 
}: StoryHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'ar' | 'en'>('all')

  const filteredStories = stories.filter(story => {
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLanguage = selectedLanguage === 'all' || story.language === selectedLanguage
    
    return matchesSearch && matchesLanguage
  })

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
          
          <div className="mt-4 text-sm text-muted-foreground">
            {filteredStories.length} of {stories.length} stories
          </div>
        </CardContent>
      </Card>

      {/* Stories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStories.map((story) => (
          <Card key={story.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {story.title}
                </CardTitle>
                <Badge variant="secondary" className="shrink-0 ml-2">
                  {story.language === 'ar' ? 'ع' : 'EN'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(story.createdAt)}
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
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
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
                        onClick={() => onContinueStory(story)}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Continue Story
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
                  variant="ghost"
                  onClick={() => onDeleteStory(story.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
  )
}