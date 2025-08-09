import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  // Log error for debugging
  console.error('Story Weaver Error:', error);

  // In development, show detailed error
  if (import.meta.env.DEV) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <Warning className="h-4 w-4" />
            <AlertTitle>Development Error</AlertTitle>
            <AlertDescription>
              An error occurred in Story Weaver. This detailed error is shown because you're in development mode.
            </AlertDescription>
          </Alert>
          
          <div className="bg-card border rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Details:</h3>
            <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-40">
              {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
          </div>
          
          <Button 
            onClick={resetErrorBoundary} 
            className="w-full"
            variant="outline"
          >
            <ArrowClockwise className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Production error - user-friendly message
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Warning className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Oops! Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            Story Weaver encountered an unexpected error. Don't worry - your stories are safe!
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={resetErrorBoundary} 
            className="w-full"
            size="lg"
          >
            <ArrowClockwise className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          If this problem persists, try refreshing the page or clearing your browser cache.
        </p>
      </div>
    </div>
  );
};
