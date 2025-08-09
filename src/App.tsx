import { useState } from 'react'
import { useKV } from './hooks/useLocalStorage'
import { StoryGenerator } from './components/StoryGenerator'
import { StoryHistory } from './components/StoryHistory'
import { CollectionsView } from './components/CollectionsView'
import { FavoritesList } from './components/FavoritesManager'
import { FeedbackWidget } from './components/FeedbackWidget'
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
  collectionId?: string
  categoryId?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  color: string
  createdAt: number
  storyIds: string[]
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  createdAt: number
}

export interface StoryContext {
  characters: Record<string, { name: string; description: string; stories: string[] }>
  themes: string[]
  recentPrompts: string[]
}

function App() {
  const [stories, setStories] = useKV<Story[]>("stories", [])
  const [collections, setCollections] = useKV<Collection[]>("collections", [])
  const [categories, setCategories] = useKV<Category[]>("categories", [
    {
      id: 'adventure',
      name: 'Adventure',
      description: 'Action-packed stories with exciting journeys',
      color: 'bg-orange-500',
      icon: 'Compass',
      createdAt: Date.now()
    },
    {
      id: 'fantasy',
      name: 'Fantasy',
      description: 'Magical worlds and mythical creatures',
      color: 'bg-purple-500',
      icon: 'MagicWand',
      createdAt: Date.now()
    },
    {
      id: 'mystery',
      name: 'Mystery',
      description: 'Suspenseful tales and puzzles to solve',
      color: 'bg-blue-500',
      icon: 'Detective',
      createdAt: Date.now()
    },
    {
      id: 'romance',
      name: 'Romance',
      description: 'Love stories and emotional journeys',
      color: 'bg-rose-500',
      icon: 'Heart',
      createdAt: Date.now()
    },
    {
      id: 'scifi',
      name: 'Science Fiction',
      description: 'Futuristic tales and technological wonders',
      color: 'bg-cyan-500',
      icon: 'Rocket',
      createdAt: Date.now()
    },
    {
      id: 'horror',
      name: 'Horror',
      description: 'Spine-chilling tales of fear and suspense',
      color: 'bg-red-500',
      icon: 'Ghost',
      createdAt: Date.now()
    }
  ])
  const [context, setContext] = useKV<StoryContext>("story-context", {
    characters: {},
    themes: [],
    recentPrompts: []
  })
  const [activeView, setActiveView] = useState<'generate' | 'history' | 'collections' | 'favorites'>('generate')
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [favorites, setFavorites] = useKV<any[]>('favorite-stories', [])

  const addStory = (story: Story) => {
    setStories(current => [story, ...current])
    
    // Update collection if story is assigned to one
    if (story.collectionId) {
      setCollections(current => 
        current.map(collection => 
          collection.id === story.collectionId
            ? { ...collection, storyIds: [story.id, ...collection.storyIds] }
            : collection
        )
      )
    }
    
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
    
    // Remove from collections
    setCollections(current => 
      current.map(collection => ({
        ...collection,
        storyIds: collection.storyIds.filter(id => id !== storyId)
      }))
    )
    
    if (selectedStory?.id === storyId) {
      setSelectedStory(null)
    }
    toast.success('Story deleted')
  }

  const createCollection = (name: string, description: string, color: string) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      description,
      color,
      createdAt: Date.now(),
      storyIds: []
    }
    setCollections(current => [newCollection, ...current])
    toast.success('Collection created successfully!')
    return newCollection
  }

  const deleteCollection = (collectionId: string) => {
    // Remove collection reference from stories
    setStories(current => 
      current.map(story => 
        story.collectionId === collectionId 
          ? { ...story, collectionId: undefined }
          : story
      )
    )
    
    setCollections(current => current.filter(c => c.id !== collectionId))
    
    if (selectedCollection?.id === collectionId) {
      setSelectedCollection(null)
    }
    toast.success('Collection deleted')
  }

  const addStoryToCollection = (storyId: string, collectionId: string) => {
    setStories(current => 
      current.map(story => 
        story.id === storyId 
          ? { ...story, collectionId }
          : story
      )
    )
    
    setCollections(current => 
      current.map(collection => 
        collection.id === collectionId
          ? { ...collection, storyIds: [...new Set([...collection.storyIds, storyId])] }
          : collection
      )
    )
    toast.success('Story added to collection!')
  }

  const removeStoryFromCollection = (storyId: string) => {
    const story = stories.find(s => s.id === storyId)
    if (!story?.collectionId) return

    setStories(current => 
      current.map(s => 
        s.id === storyId 
          ? { ...s, collectionId: undefined }
          : s
      )
    )
    
    setCollections(current => 
      current.map(collection => ({
        ...collection,
        storyIds: collection.storyIds.filter(id => id !== storyId)
      }))
    )
    toast.success('Story removed from collection!')
  }

  const updateStoryCategory = (storyId: string, categoryId: string) => {
    setStories(current => 
      current.map(story => 
        story.id === storyId 
          ? { ...story, categoryId }
          : story
      )
    )
    toast.success('Story category updated!')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView}
        storiesCount={stories.length}
        collectionsCount={collections.length}
        favoritesCount={favorites.length}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {activeView === 'generate' ? (
          <StoryGenerator 
            onStoryGenerated={addStory}
            context={context}
            recentStories={stories.slice(0, 5)}
            collections={collections}
            categories={categories}
            onCreateCollection={createCollection}
            onAddToCollection={addStoryToCollection}
          />
        ) : activeView === 'history' ? (
          <StoryHistory 
            stories={stories}
            collections={collections}
            categories={categories}
            selectedStory={selectedStory}
            onSelectStory={setSelectedStory}
            onDeleteStory={deleteStory}
            onContinueStory={(story) => {
              setActiveView('generate')
            }}
            onAddToCollection={addStoryToCollection}
            onRemoveFromCollection={removeStoryFromCollection}
            onUpdateCategory={updateStoryCategory}
            onCreateCollection={createCollection}
            onStoryGenerated={addStory}
          />
        ) : activeView === 'collections' ? (
          <CollectionsView
            collections={collections}
            stories={stories}
            categories={categories}
            selectedCollection={selectedCollection}
            onSelectCollection={setSelectedCollection}
            onCreateCollection={createCollection}
            onDeleteCollection={deleteCollection}
            onAddStoryToCollection={addStoryToCollection}
            onRemoveStoryFromCollection={removeStoryFromCollection}
            onViewStory={(story) => {
              setSelectedStory(story)
              setActiveView('history')
            }}
          />
        ) : (
          <FavoritesList />
        )}
      </main>
      
      <FeedbackWidget />
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App