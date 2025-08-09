import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, PenTool, Sparkles } from '@phosphor-icons/react'

interface HeaderProps {
  activeView: 'generate' | 'history'
  onViewChange: (view: 'generate' | 'history') => void
  storiesCount: number
}

export function Header({ activeView, onViewChange, storiesCount }: HeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" weight="fill" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Story Weaver</h1>
            <p className="text-xs text-muted-foreground">Intelligent Storyteller</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant={activeView === 'generate' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('generate')}
            className="gap-2"
          >
            <PenTool className="w-4 h-4" />
            Create Story
          </Button>
          
          <Button
            variant={activeView === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('history')}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            My Stories
            {storiesCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {storiesCount}
              </Badge>
            )}
          </Button>
        </nav>
      </div>
    </header>
  )
}