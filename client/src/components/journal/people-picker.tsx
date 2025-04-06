import { useQuery } from "@tanstack/react-query";
import { Person } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, User, X } from "lucide-react";
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
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PeoplePickerProps {
  selectedPeopleIds: number[];
  onSelectPeople: (peopleIds: number[]) => void;
}

export default function PeoplePicker({ selectedPeopleIds, onSelectPeople }: PeoplePickerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: people = [], isLoading } = useQuery<Person[]>({
    queryKey: ["/api/people"],
  });

  const selectedPeople = people.filter(p => selectedPeopleIds.includes(p.id));

  const handleTogglePerson = (personId: number) => {
    const newSelectedIds = selectedPeopleIds.includes(personId)
      ? selectedPeopleIds.filter(id => id !== personId)
      : [...selectedPeopleIds, personId];
    
    onSelectPeople(newSelectedIds);
  };

  const handleRemovePerson = (personId: number) => {
    onSelectPeople(selectedPeopleIds.filter(id => id !== personId));
  };

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
      const newPerson = await apiRequest("POST", "/api/people", {
        name: newPersonName,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      
      // Add the new person to selected people
      onSelectPeople([...selectedPeopleIds, (newPerson as Person).id]);
      
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
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedPeople.map((person) => (
          <Badge
            key={person.id}
            variant="outline"
            className="inline-flex items-center px-3 py-2 rounded-full text-sm text-secondary bg-purple-50 border border-secondary"
          >
            {person.name} 
            <Button
              size="icon"
              variant="ghost"
              className="ml-1 h-5 w-5 p-0 text-secondary hover:text-secondary/80 hover:bg-transparent"
              onClick={() => handleRemovePerson(person.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="inline-flex items-center px-3 py-2 rounded-full text-sm border border-gray-300 hover:bg-gray-100"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Person
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
              <Button 
                className="w-full" 
                onClick={handleCreatePerson}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Person"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {people.length > 0 && !isLoading && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Choose from existing people:</p>
          <div className="flex flex-wrap gap-2">
            {people
              .filter(person => !selectedPeopleIds.includes(person.id))
              .map((person) => (
                <Badge
                  key={person.id}
                  variant="outline"
                  className="inline-flex items-center px-3 py-2 rounded-full text-sm cursor-pointer border border-gray-300 hover:bg-gray-100"
                  onClick={() => handleTogglePerson(person.id)}
                >
                  <User className="h-4 w-4 mr-2" /> {person.name}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
