import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from "lucide-react";
import EntryCard from "@/components/journal/entry-card";
import EntryEditor from "@/components/journal/entry-editor";
import { useEntries } from "@/hooks/use-journal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function AllJournals() {
  const [showNewEntryEditor, setShowNewEntryEditor] = useState(false);
  const { data: entries = [], isLoading } = useEntries();
  
  // Sort entries by date, newest first
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Group entries by date
  const entriesByDate = sortedEntries.reduce((acc, entry) => {
    const date = formatDate(entry.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Journal Entries</h1>
          <p className="text-sm text-gray-600">View and manage all your entries</p>
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
        <div className="space-y-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, cardIndex) => (
                  <div key={cardIndex} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
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
            </div>
          ))}
        </div>
      ) : Object.keys(entriesByDate).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(entriesByDate).map(([date, dateEntries]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center text-lg font-medium text-gray-800">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                {date}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No journal entries yet</h3>
          <p className="text-gray-500 mb-6">Start documenting your thoughts and experiences</p>
          <Button 
            onClick={() => setShowNewEntryEditor(true)}
            className="bg-primary hover:bg-indigo-600 text-white"
          >
            <PlusCircle className="h-5 w-5 mr-1" />
            Create Your First Entry
          </Button>
        </div>
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
