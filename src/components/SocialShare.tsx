import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Share, Copy, Twitter, Facebook, MessageCircle, Mail, Link2, Heart, Download } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Story } from '../App'

interface SocialShareProps {
  story: Story
  className?: string
}

export function SocialShare({ story, className = '' }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [includeExcerpt, setIncludeExcerpt] = useState(true)

  // Generate story excerpt (first 150 characters)
  const storyExcerpt = story.content.slice(0, 150) + (story.content.length > 150 ? '...' : '')
  
  // Create shareable URL (this would be the actual URL in production)
  const storyUrl = `${window.location.origin}/story/${story.id}`
  
  // Generate share text
  const generateShareText = (platform: string) => {
    const baseText = customMessage || (story.language === 'ar' 
      ? `شاهد هذه القصة الرائعة: "${story.title}"`
      : `Check out this amazing story: "${story.title}"`)
    
    const excerpt = includeExcerpt ? `\n\n${storyExcerpt}` : ''
    const hashtags = platform === 'twitter' ? '\n\n#StoryWeaver #CreativeWriting #AI' : ''
    
    return `${baseText}${excerpt}${hashtags}\n\n${storyUrl}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(story.language === 'ar' ? 'تم النسخ بنجاح!' : 'Copied to clipboard!')
    } catch (error) {
      toast.error(story.language === 'ar' ? 'فشل في النسخ' : 'Failed to copy')
    }
  }

  const shareViaTwitter = () => {
    const text = encodeURIComponent(generateShareText('twitter'))
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareViaFacebook = () => {
    const url = encodeURIComponent(storyUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateShareText('whatsapp'))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(story.language === 'ar' 
      ? `قصة رائعة: ${story.title}`
      : `Amazing Story: ${story.title}`)
    const body = encodeURIComponent(generateShareText('email'))
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const downloadStory = () => {
    const content = `${story.title}\n\n${story.content}\n\n---\nGenerated with Story Weaver\n${new Date(story.createdAt).toLocaleDateString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(story.language === 'ar' ? 'تم تحميل القصة!' : 'Story downloaded!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share className="h-4 w-4" />
          <span className="hidden sm:inline">
            {story.language === 'ar' ? 'شارك' : 'Share'}
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            {story.language === 'ar' ? 'شارك القصة' : 'Share Story'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">
              {story.language === 'ar' ? 'رسالة مخصصة (اختيارية)' : 'Custom Message (Optional)'}
            </Label>
            <Textarea
              id="custom-message"
              placeholder={story.language === 'ar' 
                ? 'أضف رسالتك الخاصة...'
                : 'Add your own message...'}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={2}
            />
          </div>

          {/* Include Excerpt Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include-excerpt"
              checked={includeExcerpt}
              onChange={(e) => setIncludeExcerpt(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="include-excerpt" className="text-sm">
              {story.language === 'ar' ? 'تضمين مقطع من القصة' : 'Include story excerpt'}
            </Label>
          </div>

          {/* Share Buttons Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={shareViaTwitter}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            
            <Button 
              onClick={shareViaFacebook}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            
            <Button 
              onClick={shareViaWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button 
              onClick={shareViaEmail}
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>

          {/* Copy Link */}
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <Input 
                value={storyUrl} 
                readOnly 
                className="text-xs"
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(storyUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Copy Full Text */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => copyToClipboard(generateShareText('copy'))}
          >
            <Copy className="h-4 w-4 mr-2" />
            {story.language === 'ar' ? 'نسخ النص مع الرابط' : 'Copy Text with Link'}
          </Button>

          {/* Download Story */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={downloadStory}
          >
            <Download className="h-4 w-4 mr-2" />
            {story.language === 'ar' ? 'تحميل القصة' : 'Download Story'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}