import { createContext, useContext, useState, useCallback } from "react";

type TooltipContextType = {
  showTooltips: boolean;
  toggleTooltips: () => void;
};

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [showTooltips, setShowTooltips] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem("show-tooltips");
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const toggleTooltips = useCallback(() => {
    setShowTooltips(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem("show-tooltips", JSON.stringify(newValue));
      } catch {
        // Ignore localStorage errors
      }
      return newValue;
    });
  }, []);

  const value = useCallback(() => ({
    showTooltips,
    toggleTooltips
  }), [showTooltips, toggleTooltips]);

  return (
    <TooltipContext.Provider value={value()}>
      {children}
    </TooltipContext.Provider>
  );
}

export const useTooltips = () => {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error("useTooltips must be used within a TooltipProvider");
  }
  return context;
};