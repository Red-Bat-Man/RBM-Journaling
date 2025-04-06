import { useQuery } from "@tanstack/react-query";
import { Emotion } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, SmilePlus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn, getEmotionColorClass } from "@/lib/utils";

interface EmotionPickerProps {
  selectedEmotionId?: number;
  onSelect: (emotionId?: number) => void;
}

export default function EmotionPicker({ selectedEmotionId, onSelect }: EmotionPickerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmotionName, setNewEmotionName] = useState("");
  const [newEmotionEmoji, setNewEmotionEmoji] = useState("😊");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: emotions = [], isLoading } = useQuery<Emotion[]>({
    queryKey: ["/api/emotions"],
  });

  const selectedEmotion = emotions.find(e => e.id === selectedEmotionId);

  const handleCreateEmotion = async () => {
    if (!newEmotionName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for the emotion.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Default color - could be improved with a color picker
      const newEmotion = await apiRequest("POST", "/api/emotions", {
        name: newEmotionName,
        emoji: newEmotionEmoji,
        color: "#818CF8", 
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/emotions"] });
      
      // Select the newly created emotion
      onSelect((newEmotion as Emotion).id);
      
      setNewEmotionName("");
      setNewEmotionEmoji("😊");
      setIsDialogOpen(false);
      
      toast({
        title: "Emotion created",
        description: `"${newEmotionName}" has been added to your emotions.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the emotion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading emotions...</div>
        ) : (
          <>
            {emotions.map((emotion) => (
              <Badge
                key={emotion.id}
                variant="outline"
                className={cn(
                  "inline-flex items-center px-3 py-2 rounded-full text-sm cursor-pointer border transition-colors",
                  emotion.id === selectedEmotionId 
                    ? "bg-indigo-50 text-primary border-primary" 
                    : "border-gray-300 hover:bg-gray-100"
                )}
                onClick={() => onSelect(emotion.id === selectedEmotionId ? undefined : emotion.id)}
              >
                <span className="mr-2">{emotion.emoji}</span> {emotion.name}
              </Badge>
            ))}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="inline-flex items-center px-3 py-2 bg-indigo-50 rounded-full text-sm text-primary border border-primary"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Emotion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Emotion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="emotionName">Emotion Name</Label>
                    <Input
                      id="emotionName"
                      placeholder="e.g., Excited, Grateful, Confused"
                      value={newEmotionName}
                      onChange={(e) => setNewEmotionName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emotionEmoji">Emoji</Label>
                    <Input
                      id="emotionEmoji"
                      placeholder="Choose an emoji"
                      value={newEmotionEmoji}
                      onChange={(e) => setNewEmotionEmoji(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Tip: You can copy and paste an emoji or type a description
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateEmotion}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Emotion"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
      
      {selectedEmotion && (
        <div className="mt-2 text-sm">
          <span className="text-gray-600">Selected emotion: </span>
          <span className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            getEmotionColorClass(selectedEmotion.name)
          )}>
            {selectedEmotion.emoji} {selectedEmotion.name}
          </span>
        </div>
      )}
    </div>
  );
}
