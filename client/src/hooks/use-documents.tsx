import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

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
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/documents/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  return deleteMutation;
}
