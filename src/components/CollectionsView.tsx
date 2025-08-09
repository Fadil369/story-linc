import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, FolderOpen, BookOpen, Trash, Eye } from '@phosphor-icons/react'
import { Collection, Story, Category } from '../App'

interface CollectionsViewProps {
  collections: Collection[]
  stories: Story[]
  categories: Category[]
  selectedCollection: Collection | null
  onSelectCollection: (collection: Collection | null) => void
  onCreateCollection: (name: string, description: string, color: string) => Collection
  onDeleteCollection: (collectionId: string) => void
  onAddStoryToCollection: (storyId: string, collectionId: string) => void
  onRemoveStoryFromCollection: (storyId: string) => void
  onViewStory: (story: Story) => void
}

const COLLECTION_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500'
]

export function CollectionsView({
  collections,
  stories,
  categories,
  selectedCollection,
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection,
  onAddStoryToCollection,
  onRemoveStoryFromCollection,
  onViewStory
}: CollectionsViewProps) {
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [newCollectionColor, setNewCollectionColor] = useState(COLLECTION_COLORS[0])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return
    
    onCreateCollection(newCollectionName, newCollectionDescription, newCollectionColor)
    setNewCollectionName('')
    setNewCollectionDescription('')
    setNewCollectionColor(COLLECTION_COLORS[0])
    setIsCreateDialogOpen(false)
  }

  const getCollectionStories = (collection: Collection) => {
    return stories.filter(story => story.collectionId === collection.id)
  }

  const getUnorganizedStories = () => {
    return stories.filter(story => !story.collectionId)
  }

  const getCategoryName = (categoryId?: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Uncategorized'
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (selectedCollection) {
    const collectionStories = getCollectionStories(selectedCollection)
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectCollection(null)}
            >
              ← Back to Collections
            </Button>
            <div className={`w-4 h-4 rounded-full ${selectedCollection.color}`} />
            <div>
              <h2 className="text-2xl font-bold">{selectedCollection.name}</h2>
              {selectedCollection.description && (
                <p className="text-muted-foreground">{selectedCollection.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {collectionStories.length} {collectionStories.length === 1 ? 'story' : 'stories'}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDeleteCollection(selectedCollection.id)
                onSelectCollection(null)
              }}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {collectionStories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No stories in this collection</h3>
              <p className="text-muted-foreground">
                Add stories to this collection from your story history.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {collectionStories.map((story) => (
              <Card key={story.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{story.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{getCategoryName(story.categoryId)}</Badge>
                        <Badge variant="outline">{story.language === 'ar' ? 'Arabic' : 'English'}</Badge>
                        <span>•</span>
                        <span>{formatDate(story.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewStory(story)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemoveStoryFromCollection(story.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {story.content.substring(0, 200)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const unorganizedStories = getUnorganizedStories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Story Collections</h2>
          <p className="text-muted-foreground">Organize your stories into themed collections</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Group related stories together in a themed collection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input
                  id="collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Enter collection name..."
                />
              </div>
              
              <div>
                <Label htmlFor="collection-description">Description (Optional)</Label>
                <Textarea
                  id="collection-description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Collection Color</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {COLLECTION_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCollectionColor(color)}
                      className={`w-8 h-8 rounded-full ${color} transition-transform ${
                        newCollectionColor === color ? 'scale-110 ring-2 ring-ring' : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first collection to organize your stories by theme, genre, or any way you like.
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Collection
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const collectionStories = getCollectionStories(collection)
            return (
              <Card 
                key={collection.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectCollection(collection)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${collection.color}`} />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {collection.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {collectionStories.length} {collectionStories.length === 1 ? 'story' : 'stories'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(collection.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {unorganizedStories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">Unorganized Stories</h3>
            <Badge variant="secondary">{unorganizedStories.length}</Badge>
          </div>
          
          <div className="grid gap-3">
            {unorganizedStories.slice(0, 5).map((story) => (
              <Card key={story.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{story.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-xs">{getCategoryName(story.categoryId)}</Badge>
                        <Badge variant="outline" className="text-xs">{story.language === 'ar' ? 'Arabic' : 'English'}</Badge>
                        <span>•</span>
                        <span>{formatDate(story.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(collectionId) => onAddStoryToCollection(story.id, collectionId)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Add to collection" />
                        </SelectTrigger>
                        <SelectContent>
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
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewStory(story)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {unorganizedStories.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                and {unorganizedStories.length - 5} more unorganized stories...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}