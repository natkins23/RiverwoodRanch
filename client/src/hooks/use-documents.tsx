import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useDocuments() {
  const {
    data: documents,
    isLoading,
    error,
  } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  return {
    documents,
    isLoading,
    error,
  };
}

export function useDocumentUpload() {
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/documents", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  return uploadMutation;
}

export function useDocumentArchive() {
  const archiveMutation = useMutation({
    mutationFn: async ({ id, archived }: { id: number; archived: boolean }) => {
      const response = await apiRequest("PATCH", `/api/documents/${id}/archive`, { archived });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  return archiveMutation;
}

export function useDocumentDelete() {
  // Import useToast hook
  const { toast } = useToast();
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/documents/${id}`);
      return { id, ...(await response.json()) };
    },
    onSuccess: (data) => {
      // Optimistically update the UI by removing the deleted document immediately
      queryClient.setQueryData(['/api/documents'], (oldData: Document[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(doc => doc.id !== data.id);
      });
      
      // Also invalidate to ensure we get fresh data from the server
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      // Show success toast
      toast({
        title: "Document deleted",
        description: "The document has been permanently deleted.",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error deleting document",
        description: "There was a problem deleting the document. Please try again.",
        variant: "destructive",
      });
    },
  });

  return deleteMutation;
}
