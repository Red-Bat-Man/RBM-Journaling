import { Card } from "@/components/ui/card";
import { SmilePlus, User, MoreHorizontal, Bookmark } from "lucide-react";
import { cn, formatDate, getEmotionColorClass, truncateText } from "@/lib/utils";
import { EntryWithRelations } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import EntryEditor from "./entry-editor";

interface EntryCardProps {
  entry: EntryWithRelations;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleToggleFavorite = async () => {
    try {
      await apiRequest('PATCH', `/api/entries/${entry.id}/toggle-favorite`);
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/entries/favorites'] });
      
      toast({
        title: entry.isFavorite ? "Removed from bookmarks" : "Added to bookmarks",
        description: entry.isFavorite 
          ? "The entry has been removed from your bookmarks." 
          : "The entry has been added to your bookmarks.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark status.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300">
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {entry.emotion && (
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  getEmotionColorClass(entry.emotion.name)
                )}>
                  <SmilePlus className="h-4 w-4 mr-1" />
                  {entry.emotion.name}
                </span>
              )}
              
              {entry.people && entry.people.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-secondary">
                  <User className="h-4 w-4 mr-1" />
                  {entry.people[0].name}
                  {entry.people.length > 1 && ` +${entry.people.length - 1}`}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(entry.createdAt)}
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-2">{entry.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {truncateText(entry.content, 150)}
          </p>
        </div>
        <div className="px-5 py-3 bg-gray-50 flex justify-between">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleToggleFavorite}
            className={cn(
              entry.isFavorite ? "text-primary" : "text-gray-600"
            )}
          >
            <Bookmark className="h-5 w-5" fill={entry.isFavorite ? "currentColor" : "none"} />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setIsEditing(true)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </Card>
      
      {isEditing && (
        <EntryEditor
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          entry={entry}
        />
      )}
    </>
  );
}
