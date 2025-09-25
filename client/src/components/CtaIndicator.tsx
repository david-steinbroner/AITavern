import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CtaIndicatorProps {
  target?: string; // CSS selector for the target element
  className?: string;
}

export default function CtaIndicator({ target = "[data-testid*='button-continue'], [data-testid*='button-back'], [data-testid*='button-skip']", className = "" }: CtaIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const targetElement = document.querySelector(target);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if the target is fully visible
      const isElementVisible = rect.top >= 0 && rect.bottom <= windowHeight;
      setIsVisible(isElementVisible);
      
      // Only show indicator if element exists but isn't visible and there's content above
      const hasContentAbove = document.documentElement.scrollHeight > windowHeight;
      setShouldShow(!isElementVisible && hasContentAbove);
    };

    // Check on mount and scroll
    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    // Check after a delay for dynamic content
    const timeout = setTimeout(checkVisibility, 1000);

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      clearTimeout(timeout);
    };
  }, [target]);

  const handleClick = () => {
    const targetElement = document.querySelector(target);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  if (!shouldShow) return null;

  return (
    <div 
      className={`fixed bottom-20 right-4 z-50 animate-bounce cursor-pointer ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="Scroll to action buttons"
    >
      <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
        <ChevronDown className="w-5 h-5" />
      </div>
    </div>
  );
}