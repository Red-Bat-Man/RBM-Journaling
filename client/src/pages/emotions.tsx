import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEmotions, useEntriesByEmotion } from "@/hooks/use-journal";
import { Skeleton } from "@/components/ui/skeleton";
import { SmilePlus, PlusCircle } from "lucide-react";
import EntryCard from "@/components/journal/entry-card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export default function Emotions() {
  const { data: emotions = [], isLoading: emotionsLoading } = useEmotions();
  const [selectedEmotionId, setSelectedEmotionId] = useState<number | null>(null);
  const { data: entriesByEmotion = [], isLoading: entriesLoading } = useEntriesByEmotion(
    selectedEmotionId || 0
  );
  
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmotionName, setNewEmotionName] = useState("");
  const [newEmotionEmoji, setNewEmotionEmoji] = useState("😊");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      await apiRequest("POST", "/api/emotions", {
        name: newEmotionName,
        emoji: newEmotionEmoji,
        color: "#818CF8", // Default color
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/emotions"] });
      
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
    <div className="p-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emotions</h1>
          <p className="text-sm text-gray-600">Track and filter journal entries by emotions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-indigo-600 text-white">
              <PlusCircle className="h-5 w-5 mr-1" />
              New Emotion
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateEmotion}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Emotion"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Emotions List */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filter by Emotion</h2>
        {emotionsLoading ? (
          <div className="flex flex-wrap gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-32" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {emotions.map((emotion) => (
              <Badge
                key={emotion.id}
                variant="outline"
                className={cn(
                  "text-base py-3 px-4 cursor-pointer",
                  emotion.id === selectedEmotionId
                    ? "bg-indigo-50 text-primary border-primary"
                    : "hover:bg-gray-100"
                )}
                onClick={() => setSelectedEmotionId(
                  emotion.id === selectedEmotionId ? null : emotion.id
                )}
              >
                <span className="mr-2">{emotion.emoji}</span> {emotion.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Entries by Emotion */}
      {selectedEmotion && (
        <div>
          <div className="flex items-center mb-4">
            <SmilePlus className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-xl font-semibold text-gray-800">
              Journal entries with {selectedEmotion.emoji} {selectedEmotion.name}
            </h2>
          </div>
          
          {entriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="p-5">
                    <div className="flex justify-between mb-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="px-5 py-3 bg-gray-50 flex justify-between">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
          ) : entriesByEmotion.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entriesByEmotion.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600 mb-2">
                  No journal entries with this emotion yet.
                </p>
                <p className="text-gray-500 text-sm">
                  Create a new journal entry and select this emotion.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {!selectedEmotion && !emotionsLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <SmilePlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Select an emotion to view related entries
            </h3>
            <p className="text-gray-500">
              Choose from the emotions above to filter your journal entries
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
