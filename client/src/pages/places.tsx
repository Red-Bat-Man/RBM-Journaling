import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Place, InsertPlace } from "@shared/schema";

export default function Places() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceIcon, setNewPlaceIcon] = useState("📍");
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ["/api/places"],
  });

  // Add a new place
  const addMutation = useMutation({
    mutationFn: async (place: InsertPlace) => {
      const res = await apiRequest("POST", "/api/places", place);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      setIsAddOpen(false);
      setNewPlaceName("");
      setNewPlaceIcon("📍");
      toast({
        title: "Place added",
        description: "The place has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add place",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit a place
  const editMutation = useMutation({
    mutationFn: async ({ id, place }: { id: number; place: Partial<InsertPlace> }) => {
      const res = await apiRequest("PUT", `/api/places/${id}`, place);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      setIsEditOpen(false);
      setEditingPlace(null);
      toast({
        title: "Place updated",
        description: "The place has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update place",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a place
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/places/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      setIsDeleteOpen(false);
      setEditingPlace(null);
      toast({
        title: "Place deleted",
        description: "The place has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete place",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName) return;
    
    addMutation.mutate({
      name: newPlaceName,
      icon: newPlaceIcon || "📍",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace || !editingPlace.name) return;
    
    editMutation.mutate({
      id: editingPlace.id,
      place: {
        name: editingPlace.name,
        icon: editingPlace.icon,
      },
    });
  };

  const handleDeleteSubmit = () => {
    if (!editingPlace) return;
    deleteMutation.mutate(editingPlace.id);
  };

  const openEditDialog = (place: Place) => {
    setEditingPlace(place);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (place: Place) => {
    setEditingPlace(place);
    setIsDeleteOpen(true);
  };

  const iconOptions = ["📍", "🏠", "🏢", "☕", "🍽️", "🌳", "💪", "🏖️", "🎓", "🏫", "🏥", "🏪", "🏬", "🏭", "🏰", "⛪", "🕌", "🕍", "⛩️", "🏛️"];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Places</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Place</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newPlaceName}
                    onChange={(e) => setNewPlaceName(e.target.value)}
                    placeholder="e.g., Coffee Shop"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant={newPlaceIcon === icon ? "default" : "outline"}
                        className="w-10 h-10 p-0"
                        onClick={() => setNewPlaceIcon(icon)}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newPlaceName || addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add Place"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading places...</div>
      ) : places && places.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <Card key={place.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{place.icon}</span>
                    <span>{place.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(place)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(place)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => window.location.href = `/entries/by-place/${place.id}`}
                >
                  View associated entries
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground mb-4">No places added yet</p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first place
          </Button>
        </div>
      )}

      {/* Edit Place Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingPlace?.name || ""}
                  onChange={(e) => setEditingPlace(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="e.g., Coffee Shop"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={editingPlace?.icon === icon ? "default" : "outline"}
                      className="w-10 h-10 p-0"
                      onClick={() => setEditingPlace(prev => prev ? { ...prev, icon } : null)}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editingPlace?.name || editMutation.isPending}>
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Place Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Place</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{editingPlace?.name}"?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This will remove the place reference from all associated journal entries.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Place"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}