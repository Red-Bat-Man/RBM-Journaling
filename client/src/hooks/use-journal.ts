import { useQuery, useMutation } from "@tanstack/react-query";
import { EntryWithRelations, Emotion, Person } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useEntries() {
  return useQuery<EntryWithRelations[]>({
    queryKey: ['/api/entries'],
  });
}

export function useEntry(id: number) {
  return useQuery<EntryWithRelations>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });
}

export function useFavoriteEntries() {
  return useQuery<EntryWithRelations[]>({
    queryKey: ['/api/entries/favorites'],
  });
}

export function useEntriesByEmotion(emotionId: number) {
  return useQuery<EntryWithRelations[]>({
    queryKey: [`/api/entries/by-emotion/${emotionId}`],
    enabled: !!emotionId,
  });
}

export function useEntriesByPerson(personId: number) {
  return useQuery<EntryWithRelations[]>({
    queryKey: [`/api/entries/by-person/${personId}`],
    enabled: !!personId,
  });
}

export function useEmotions() {
  return useQuery<Emotion[]>({
    queryKey: ['/api/emotions'],
  });
}

export function usePeople() {
  return useQuery<Person[]>({
    queryKey: ['/api/people'],
  });
}

export function useToggleFavorite() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (entryId: number) => {
      await apiRequest('PATCH', `/api/entries/${entryId}/toggle-favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/entries/favorites'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  });
}

export function useDeleteEntry() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (entryId: number) => {
      await apiRequest('DELETE', `/api/entries/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/entries/favorites'] });
      toast({
        title: "Entry deleted",
        description: "The journal entry has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the entry. Please try again.",
        variant: "destructive",
      });
    }
  });
}
