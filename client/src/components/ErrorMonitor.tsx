import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorMonitorProps {
  currentView?: string;
  activeTab?: string;
}

export function ErrorMonitor({ currentView, activeTab }: ErrorMonitorProps) {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        context: { currentView, activeTab }
      });

      // Show user-friendly toast for runtime errors
      toast({
        title: "Something went wrong",
        description: "Please try refreshing the page if the issue persists.",
        variant: "destructive",
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', {
        reason: event.reason,
        context: { currentView, activeTab }
      });

      // Show user-friendly toast for async errors
      toast({
        title: "Network or processing error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [currentView, activeTab, toast]);

  return null; // This component only handles errors, no UI
}