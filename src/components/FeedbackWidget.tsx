import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ChatTeardropText, Star, Bug, Lightbulb, Heart } from '@phosphor-icons/react'
import { submitFeedback, trackUserAction } from '../lib/analytics'
import { toast } from 'sonner'

interface FeedbackWidgetProps {
  className?: string
}

export function FeedbackWidget({ className = '' }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'improvement' | 'rating'>('rating')
  const [rating, setRating] = useState<number>(5)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim() && feedbackType !== 'rating') {
      toast.error('Please provide some feedback details')
      return
    }

    setIsSubmitting(true)
    
    try {
      await submitFeedback({
        type: feedbackType,
        rating: feedbackType === 'rating' ? rating : undefined,
        message: message.trim(),
        context: {
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })

      trackUserAction('feedback_submitted', {
        type: feedbackType,
        rating: feedbackType === 'rating' ? rating : undefined,
        hasMessage: !!message.trim()
      })

      toast.success('Thank you for your feedback!')
      setIsOpen(false)
      setMessage('')
      setRating(5)
      setFeedbackType('rating')
      
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4" />
      case 'feature': return <Lightbulb className="w-4 h-4" />
      case 'improvement': return <Heart className="w-4 h-4" />
      case 'rating': return <Star className="w-4 h-4" />
      default: return <ChatTeardropText className="w-4 h-4" />
    }
  }

  const getFeedbackLabel = (type: string) => {
    switch (type) {
      case 'bug': return 'Report a Bug'
      case 'feature': return 'Request Feature'
      case 'improvement': return 'Suggest Improvement'
      case 'rating': return 'Rate Experience'
      default: return 'General Feedback'
    }
  }

  const renderRatingStars = () => {
    return (
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`p-1 rounded transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            <Star className="w-6 h-6" weight={star <= rating ? 'fill' : 'regular'} />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`fixed bottom-4 right-4 shadow-lg bg-white border-primary/20 hover:bg-primary/5 ${className}`}
          onClick={() => trackUserAction('feedback_widget_opened')}
        >
          <ChatTeardropText className="w-4 h-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChatTeardropText className="w-5 h-5 text-primary" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve Story Weaver by sharing your thoughts and suggestions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Feedback Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">What would you like to share?</Label>
            <RadioGroup value={feedbackType} onValueChange={(value: any) => setFeedbackType(value)}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'rating', label: 'Rate Experience', icon: 'Star' },
                  { value: 'bug', label: 'Report Bug', icon: 'Bug' },
                  { value: 'feature', label: 'Request Feature', icon: 'Lightbulb' },
                  { value: 'improvement', label: 'Suggest Improvement', icon: 'Heart' }
                ].map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      feedbackType === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    {getFeedbackIcon(option.value)}
                    <span className="text-sm">{option.label}</span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Rating Stars (shown for rating type) */}
          {feedbackType === 'rating' && (
            <div>
              <Label className="text-sm font-medium mb-3 block">How was your experience?</Label>
              {renderRatingStars()}
              <p className="text-xs text-gray-500 text-center mt-2">
                {rating === 1 && 'Very Poor'}
                {rating === 2 && 'Poor'}
                {rating === 3 && 'Average'}
                {rating === 4 && 'Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>
          )}

          {/* Feedback Message */}
          <div>
            <Label htmlFor="feedback-message" className="text-sm font-medium mb-2 block">
              {feedbackType === 'rating' ? 'Additional comments (optional)' : 'Please describe in detail'}
              {feedbackType !== 'rating' && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="feedback-message"
              placeholder={
                feedbackType === 'bug' 
                  ? 'Describe what happened, what you expected, and steps to reproduce...'
                  : feedbackType === 'feature'
                  ? 'Describe the feature you would like to see and how it would help...'
                  : feedbackType === 'improvement'
                  ? 'What could be improved and how would you like it to work...'
                  : 'Share any additional thoughts about your experience...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (!message.trim() && feedbackType !== 'rating')}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quick feedback component for inline usage
export function QuickFeedback({ onFeedback }: { onFeedback?: (rating: number) => void }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const handleRating = async (rating: number) => {
    setSelectedRating(rating)
    
    try {
      await submitFeedback({
        type: 'rating',
        rating,
        message: '',
        context: {
          component: 'quick_feedback',
          page: window.location.pathname
        }
      })

      trackUserAction('quick_rating', { rating })
      onFeedback?.(rating)
      
      toast.success('Thank you for your rating!')
    } catch (error) {
      toast.error('Failed to submit rating')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">How was this?</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            className={`p-1 rounded transition-colors ${
              selectedRating === star 
                ? 'text-yellow-400' 
                : selectedRating && selectedRating < star
                ? 'text-gray-300'
                : 'text-gray-400 hover:text-yellow-300'
            }`}
            disabled={selectedRating !== null}
          >
            <Star 
              className="w-4 h-4" 
              weight={selectedRating && selectedRating >= star ? 'fill' : 'regular'} 
            />
          </button>
        ))}
      </div>
    </div>
  )
}