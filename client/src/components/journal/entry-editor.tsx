import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EntryWithRelations } from "@shared/schema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import EmotionPicker from "./emotion-picker";
import PeoplePicker from "./people-picker";
import PlacePicker from "./place-picker";
import VoiceRecorder from "./voice-recorder";
import { formatTimeAgo } from "@/lib/utils";
import { Bold, Italic, List, Link, Image } from 'lucide-react';

interface EntryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: EntryWithRelations;
}

export default function EntryEditor({ isOpen, onClose, entry }: EntryEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  // Convert null to undefined for the emotion ID
  const initialEmotionId = entry?.emotionId !== null && entry?.emotionId !== undefined 
    ? entry.emotionId 
    : undefined;
  const [selectedEmotionId, setSelectedEmotionId] = useState<number | undefined>(initialEmotionId);
  
  // Convert null to undefined for the place ID
  const initialPlaceId = entry?.placeId !== null && entry?.placeId !== undefined 
    ? entry.placeId 
    : undefined;
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | undefined>(initialPlaceId);
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<number[]>(
    entry?.people ? entry.people.map(p => p.id) : []
  );
  const [isFavorite, setIsFavorite] = useState(entry?.isFavorite || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your journal entry.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        entry: {
          title,
          content,
          emotionId: selectedEmotionId,
          placeId: selectedPlaceId,
          isFavorite,
        },
        peopleIds: selectedPeopleIds,
      };

      if (entry) {
        // Update existing entry
        await apiRequest("PUT", `/api/entries/${entry.id}`, entryData);
        toast({
          title: "Entry updated",
          description: "Your journal entry has been updated.",
        });
      } else {
        // Create new entry
        await apiRequest("POST", "/api/entries", entryData);
        toast({
          title: "Entry created",
          description: "Your new journal entry has been saved.",
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormatClick = (formatType: string) => {
    toast({
      title: "Text formatting",
      description: `${formatType} formatting will be available in a future update.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 py-4">
          <div className="mb-4">
            <Label htmlFor="entryTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </Label>
            <Input
              id="entryTitle"
              placeholder="Give your journal entry a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              How did this make you feel?
            </Label>
            <EmotionPicker
              selectedEmotionId={selectedEmotionId}
              onSelect={setSelectedEmotionId}
            />
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              People Involved
            </Label>
            <PeoplePicker
              selectedPeopleIds={selectedPeopleIds}
              onSelectPeople={setSelectedPeopleIds}
            />
          </div>

          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </Label>
            <PlacePicker
              selectedPlaceId={selectedPlaceId}
              onSelect={setSelectedPlaceId}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="entryContent" className="block text-sm font-medium text-gray-700">
                Journal Content
              </Label>
              <VoiceRecorder onTranscription={(text) => setContent(prev => prev ? `${prev} ${text}` : text)} />
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleFormatClick("List")}
                >
                  <List className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleFormatClick("Bold")}
                >
                  <Bold className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleFormatClick("Italic")}
                >
                  <Italic className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleFormatClick("Link")}
                >
                  <Link className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleFormatClick("Image")}
                >
                  <Image className="h-5 w-5" />
                </Button>
              </div>
              <Textarea
                id="entryContent"
                rows={8}
                placeholder="Write about your experience or use voice recording..."
                className="w-full px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary border-0 resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t border-gray-200 px-0 pt-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {entry && (
              <div className="text-sm text-gray-600">
                Last edited: {formatTimeAgo(entry.createdAt)}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="favorite" 
                checked={isFavorite} 
                onCheckedChange={(checked) => setIsFavorite(checked as boolean)}
              />
              <Label htmlFor="favorite" className="text-sm text-gray-600">
                Add to favorites
              </Label>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
