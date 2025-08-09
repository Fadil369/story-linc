import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { StoryGenerator } from './components/StoryGenerator'
import { StoryHistory } from './components/StoryHistory'
import { Header } from './components/Header'
import { toast, Toaster } from 'sonner'

export interface Story {
  id: string
  title: string
  content: string
  prompt: string
  language: 'ar' | 'en'
  createdAt: number
  characters?: string[]
  themes?: string[]
}

export interface StoryContext {
  characters: Record<string, { name: string; description: string; stories: string[] }>
  themes: string[]
  recentPrompts: string[]
}

function App() {
  const [stories, setStories] = useKV<Story[]>("stories", [])
  const [context, setContext] = useKV<StoryContext>("story-context", {
    characters: {},
    themes: [],
    recentPrompts: []
  })
  const [activeView, setActiveView] = useState<'generate' | 'history'>('generate')
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  const addStory = (story: Story) => {
    setStories(current => [story, ...current])
    
    // Update context
    setContext(current => ({
      ...current,
      recentPrompts: [story.prompt, ...current.recentPrompts.slice(0, 9)],
      themes: story.themes ? [...new Set([...current.themes, ...story.themes])] : current.themes
    }))
    
    toast.success(story.language === 'ar' ? 'تم إنشاء القصة بنجاح!' : 'Story created successfully!')
  }

  const deleteStory = (storyId: string) => {
    setStories(current => current.filter(s => s.id !== storyId))
    if (selectedStory?.id === storyId) {
      setSelectedStory(null)
    }
    toast.success('Story deleted')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView}
        storiesCount={stories.length}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {activeView === 'generate' ? (
          <StoryGenerator 
            onStoryGenerated={addStory}
            context={context}
            recentStories={stories.slice(0, 5)}
          />
        ) : (
          <StoryHistory 
            stories={stories}
            selectedStory={selectedStory}
            onSelectStory={setSelectedStory}
            onDeleteStory={deleteStory}
            onContinueStory={(story) => {
              setActiveView('generate')
              // Could pass story for continuation
            }}
          />
        )}
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App