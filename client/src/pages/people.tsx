import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePeople, useEntriesByPerson } from "@/hooks/use-journal";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, User, PlusCircle } from "lucide-react";
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

export default function People() {
  const { data: people = [], isLoading: peopleLoading } = usePeople();
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const { data: entriesByPerson = [], isLoading: entriesLoading } = useEntriesByPerson(
    selectedPersonId || 0
  );
  
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const selectedPerson = people.find(p => p.id === selectedPersonId);

  const handleCreatePerson = async () => {
    if (!newPersonName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for the person.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/people", {
        name: newPersonName,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      
      setNewPersonName("");
      setIsDialogOpen(false);
      
      toast({
        title: "Person added",
        description: `"${newPersonName}" has been added to your people.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add the person. Please try again.",
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
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
          <p className="text-sm text-gray-600">Track and filter journal entries by people</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-indigo-600 text-white">
              <PlusCircle className="h-5 w-5 mr-1" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="personName">Person's Name</Label>
                <Input
                  id="personName"
                  placeholder="Enter name"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePerson}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Person"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* People List */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filter by Person</h2>
        {peopleLoading ? (
          <div className="flex flex-wrap gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-32" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {people.map((person) => (
              <Badge
                key={person.id}
                variant="outline"
                className={cn(
                  "text-base py-3 px-4 cursor-pointer",
                  person.id === selectedPersonId
                    ? "bg-purple-50 text-secondary border-secondary"
                    : "hover:bg-gray-100"
                )}
                onClick={() => setSelectedPersonId(
                  person.id === selectedPersonId ? null : person.id
                )}
              >
                <User className="h-4 w-4 mr-2" /> {person.name}
              </Badge>
            ))}
            {people.length === 0 && (
              <p className="text-gray-500">No people added yet. Add someone to get started.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Entries by Person */}
      {selectedPerson && (
        <div>
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 mr-2 text-secondary" />
            <h2 className="text-xl font-semibold text-gray-800">
              Journal entries with {selectedPerson.name}
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
          ) : entriesByPerson.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entriesByPerson.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600 mb-2">
                  No journal entries with this person yet.
                </p>
                <p className="text-gray-500 text-sm">
                  Create a new journal entry and include this person.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {!selectedPerson && !peopleLoading && people.length > 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Select a person to view related entries
            </h3>
            <p className="text-gray-500">
              Choose from the people above to filter your journal entries
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
