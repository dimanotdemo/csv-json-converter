import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DownloadButtonProps {
  onDownload: () => Promise<void>;
  className?: string;
}

export default function DownloadButton({ onDownload, className }: DownloadButtonProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    try {
      setStatus('processing');
      setProgress(0);
      setError(null);
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + (90 - prev) * 0.1;
        });
      }, 100);

      // Perform the actual download
      await onDownload();

      // Complete the progress
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('complete');

      // Reset after showing completion
      const resetTimer = setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 2000);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(resetTimer);
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate download';
      setError(errorMessage);
      setStatus('error');
      setProgress(0);
      
      // Auto-reset error state after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setError(null);
      }, 5000);
    }
  }, [onDownload]);

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        onClick={handleClick}
        className={cn(
          "shadow-lg min-w-[160px] transition-colors duration-300",
          status === 'complete' && "bg-green-600 hover:bg-green-700",
          status === 'error' && "bg-destructive hover:bg-destructive/90",
          className
        )}
        disabled={status === 'processing'}
      >
        {status === 'idle' && (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </>
        )}
        {status === 'processing' && (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        )}
        {status === 'complete' && (
          <>
            <Check className="w-4 h-4 mr-2" />
            Complete!
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Failed
          </>
        )}
      </Button>
      
      {(status === 'processing' || status === 'complete') && (
        <Progress 
          value={progress} 
          className={cn(
            "h-1 w-[160px]",
            status === 'complete' && "bg-green-100 [&>[data-state=complete]]:bg-green-600"
          )}
        />
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 