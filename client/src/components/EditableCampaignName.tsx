import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EditableCampaignNameProps {
  campaignName: string;
  campaignId?: string;
  className?: string;
}

export default function EditableCampaignName({
  campaignName,
  campaignId,
  className = ""
}: EditableCampaignNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(campaignName);
  const { toast } = useToast();

  const updateCampaignMutation = useMutation({
    mutationFn: async (newName: string) => {
      if (!campaignId) throw new Error("No campaign ID available");
      const response = await apiRequest('PATCH', `/api/campaigns/${campaignId}`, { name: newName });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/active'] });
      setIsEditing(false);
      toast({
        title: "Campaign renamed",
        description: "Your campaign name has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Failed to update campaign name:', error);
      toast({
        title: "Failed to rename campaign",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (editValue.trim() && editValue !== campaignName) {
      updateCampaignMutation.mutate(editValue.trim());
    } else {
      setIsEditing(false);
      setEditValue(campaignName);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(campaignName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-lg sm:text-xl font-serif text-primary bg-transparent border-primary/20"
          autoFocus
          data-testid="input-campaign-name"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={updateCampaignMutation.isPending}
          className="h-8 w-8 p-0"
          data-testid="button-save-campaign-name"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={updateCampaignMutation.isPending}
          className="h-8 w-8 p-0"
          data-testid="button-cancel-campaign-name"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <h1 className="font-serif text-base sm:text-lg md:text-xl text-primary text-center truncate max-w-[240px] sm:max-w-[300px] md:max-w-none" data-testid="campaign-title">
        ⚔️ {campaignName}
      </h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
        data-testid="button-edit-campaign-name"
      >
        <Edit2 className="w-3 h-3" />
      </Button>
    </div>
  );
}