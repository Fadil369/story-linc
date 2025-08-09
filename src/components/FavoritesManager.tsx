import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Story } from '../App'

interface FavoriteStory extends Story {
  favoritedAt: number
  rating?: number
}

interface FavoritesManagerProps {
  story: Story
  className?: string
}

export function FavoritesManager({ story, className = '' }: FavoritesManagerProps) {
  const [favorites, setFavorites] = useKV<FavoriteStory[]>('favorite-stories', [])
  const [rating, setRating] = useState<number>(0)
  const [showRating, setShowRating] = useState(false)

  const isFavorite = favorites?.some(fav => fav.id === story.id) ?? false
  const currentFavorite = favorites?.find(fav => fav.id === story.id)

  const toggleFavorite = () => {
    if (isFavorite) {
      // Remove from favorites
      setFavorites(current => (current || []).filter(fav => fav.id !== story.id))
      toast.success(story.language === 'ar' ? 'تم إزالة القصة من المفضلة' : 'Story removed from favorites')
    } else {
      // Add to favorites
      const favoriteStory: FavoriteStory = {
        ...story,
        favoritedAt: Date.now(),
        rating: rating || undefined
      }
      setFavorites(current => [favoriteStory, ...(current || [])])
      toast.success(story.language === 'ar' ? 'تم إضافة القصة للمفضلة!' : 'Story added to favorites!')

      if (!rating) {
        setShowRating(true)
      }
    }
  }

  const updateRating = (newRating: number) => {
    setRating(newRating)
    if (isFavorite) {
      setFavorites(current =>
        (current || []).map(fav =>
          fav.id === story.id ? { ...fav, rating: newRating } : fav
        )
      )
      toast.success(story.language === 'ar' ? 'تم تحديث التقييم!' : 'Rating updated!')
    }
    setShowRating(false)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={isFavorite ? "default" : "outline"}
        size="sm"
        onClick={toggleFavorite}
        className={isFavorite ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}
      >
        {isFavorite ? (
          <Heart className="h-4 w-4 fill-current" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
        <span className="hidden sm:inline ml-2">
          {isFavorite
            ? (story.language === 'ar' ? 'مفضلة' : 'Favorite')
            : (story.language === 'ar' ? 'أضف للمفضلة' : 'Add to Favorites')
          }
        </span>
      </Button>

      {(isFavorite || showRating) && (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={() => updateRating(star)}
            >
              {star <= (currentFavorite?.rating || rating) ? (
                <Star className="h-4 w-4 fill-current text-yellow-500" />
              ) : (
                <Star className="h-4 w-4 text-gray-300" />
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FavoritesList() {
  const [favorites, setFavorites] = useKV<FavoriteStory[]>('favorite-stories', [])
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'title'>('recent')

  const sortedFavorites = [...(favorites || [])].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'recent':
      default:
        return b.favoritedAt - a.favoritedAt
    }
  })

  const removeFavorite = (storyId: string) => {
    setFavorites(current => (current || []).filter(fav => fav.id !== storyId))
    toast.success('Story removed from favorites')
  }

  if (!favorites || favorites.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No favorite stories yet</h3>
        <p className="text-muted-foreground">
          Start adding stories to your favorites to see them here!
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          Favorite Stories ({favorites.length})
        </h2>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            Recent
          </Button>
          <Button
            variant={sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('rating')}
          >
            Rating
          </Button>
          <Button
            variant={sortBy === 'title' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('title')}
          >
            Title
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedFavorites.map((story) => (
          <Card key={story.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{story.title}</h3>
                  <Badge variant="outline">
                    {story.language === 'ar' ? 'عربي' : 'English'}
                  </Badge>
                  {story.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span className="text-sm font-medium">{story.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {story.content.slice(0, 150)}...
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Added {new Date(story.favoritedAt).toLocaleDateString()}</span>
                  {story.themes && story.themes.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{story.themes.slice(0, 2).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFavorite(story.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
