import { ReactNode } from "react";
import StickyBottomActions from "./StickyBottomActions";

// Standard CTA bar height for consistent spacing
export const CTA_BAR_HEIGHT = 140; // Height in pixels including padding and safe area

interface MobileStepLayoutProps {
  children: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  onSkip?: () => void;
  backLabel?: string;
  continueLabel?: string;
  skipLabel?: string;
  showBack?: boolean;
  showContinue?: boolean;
  showSkip?: boolean;
  continueDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function MobileStepLayout({
  children,
  onBack,
  onContinue,
  onSkip,
  backLabel = "Back",
  continueLabel = "Continue",
  skipLabel = "Skip",
  showBack = true,
  showContinue = true,
  showSkip = false,
  continueDisabled = false,
  isLoading = false,
  className = ""
}: MobileStepLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Content area with consistent padding and bottom space reservation */}
      <div 
        className="flex-1 p-4 overflow-y-auto"
        style={{ paddingBottom: `${CTA_BAR_HEIGHT}px` }}
      >
        {children}
      </div>
      
      {/* Standardized CTA buttons */}
      <StickyBottomActions
        onBack={showBack ? onBack : undefined}
        onContinue={showContinue ? onContinue : undefined}
        onSkip={showSkip ? onSkip : undefined}
        backLabel={backLabel}
        continueLabel={continueLabel}
        skipLabel={skipLabel}
        showBack={showBack}
        showContinue={showContinue}
        showSkip={showSkip}
        continueDisabled={continueDisabled}
      />
    </div>
  );
}