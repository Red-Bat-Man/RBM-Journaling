import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bookmark } from "lucide-react";
import EntryCard from "@/components/journal/entry-card";
import EntryEditor from "@/components/journal/entry-editor";
import { useFavoriteEntries } from "@/hooks/use-journal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Bookmarks() {
  const [showNewEntryEditor, setShowNewEntryEditor] = useState(false);
  const { data: entries = [], isLoading } = useFavoriteEntries();
  
  // Sort entries by date, newest first
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
          <p className="text-sm text-gray-600">Your favorite journal entries</p>
        </div>
        <Button 
          onClick={() => setShowNewEntryEditor(true)}
          className="bg-primary hover:bg-indigo-600 text-white"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          New Entry
        </Button>
      </div>
      
      {/* Entries Container */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
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
      ) : sortedEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No bookmarked entries yet</h3>
            <p className="text-gray-500 mb-6">
              Bookmark your favorite journal entries to find them easily later
            </p>
            <Button 
              onClick={() => setShowNewEntryEditor(true)}
              className="bg-primary hover:bg-indigo-600 text-white"
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              Create New Entry
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Entry Editor Modal */}
      {showNewEntryEditor && (
        <EntryEditor
          isOpen={showNewEntryEditor}
          onClose={() => setShowNewEntryEditor(false)}
        />
      )}
    </div>
  );
}
