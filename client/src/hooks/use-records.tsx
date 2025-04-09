import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useRecords() {
  const {
    data: records,
    isLoading,
    error,
  } = useQuery<Document[]>({
    queryKey: ['/api/records'],
  });

  return {
    records,
    isLoading,
    error,
  };
}

export function useRecordUpload() {
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/records", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
    },
  });

  return uploadMutation;
}

export function useRecordArchive() {
  const archiveMutation = useMutation({
    mutationFn: async ({ id, archived }: { id: number; archived: boolean }) => {
      const response = await apiRequest("PATCH", `/api/records/${id}/archive`, { archived });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
    },
  });

  return archiveMutation;
}

export function useRecordDelete() {
  // Import useToast hook
  const { toast } = useToast();
  
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await apiRequest("DELETE", `/api/records/${id}`);
      return { id, ...(await response.json()) };
    },
    onSuccess: (data) => {
      // Optimistically update the UI by removing the deleted record immediately
      queryClient.setQueryData(['/api/records'], (oldData: Document[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(doc => doc.id !== data.id);
      });
      
      // Also invalidate to ensure we get fresh data from the server
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      
      // Show success toast
      toast({
        title: "Record deleted",
        description: "The record has been permanently deleted.",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error deleting record",
        description: "There was a problem deleting the record. Please try again.",
        variant: "destructive",
      });
    },
  });

  return deleteMutation;
}