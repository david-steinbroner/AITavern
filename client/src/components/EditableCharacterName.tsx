import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EditableCharacterNameProps {
  characterName: string;
  characterId?: string;
  className?: string;
}

export default function EditableCharacterName({
  characterName,
  characterId,
  className = ""
}: EditableCharacterNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(characterName);
  const { toast } = useToast();

  const updateCharacterMutation = useMutation({
    mutationFn: async (newName: string) => {
      if (!characterId) throw new Error("No character ID available");
      const response = await apiRequest('PATCH', `/api/character/${characterId}`, { name: newName });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      setIsEditing(false);
      toast({
        title: "Character renamed",
        description: "Your character name has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Failed to update character name:', error);
      toast({
        title: "Failed to rename character",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (editValue.trim() && editValue !== characterName) {
      updateCharacterMutation.mutate(editValue.trim());
    } else {
      setIsEditing(false);
      setEditValue(characterName);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(characterName);
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
          className="h-8 text-2xl font-serif text-primary bg-transparent border-primary/20"
          autoFocus
          data-testid="input-character-name"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={updateCharacterMutation.isPending}
          className="h-8 w-8 p-0"
          data-testid="button-save-character-name"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={updateCharacterMutation.isPending}
          className="h-8 w-8 p-0"
          data-testid="button-cancel-character-name"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <h2 className="font-serif text-2xl text-primary" data-testid="character-name">
        {characterName}
      </h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
        data-testid="button-edit-character-name"
      >
        <Edit2 className="w-3 h-3" />
      </Button>
    </div>
  );
}