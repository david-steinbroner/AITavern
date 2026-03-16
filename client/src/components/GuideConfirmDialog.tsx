import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface GuideConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function GuideConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Never mind",
  onConfirm,
  onCancel,
}: GuideConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#FFF9F0] border-[#C9B6E4]/30 rounded-xl max-w-sm mx-auto">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-lg font-bold text-[#6C7A89]">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm text-[#6C7A89]/70">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {children && <div className="py-2">{children}</div>}

        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onConfirm}
            className="min-h-[44px] bg-[#FFB6B9] text-[#6C7A89] font-semibold hover:bg-[#FFB6B9]/80 border-0 rounded-lg"
          >
            {confirmLabel}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onCancel}
            className="min-h-[44px] bg-[#C9B6E4]/20 text-[#6C7A89] font-medium hover:bg-[#C9B6E4]/30 border-[#C9B6E4]/30 rounded-lg"
          >
            {cancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
