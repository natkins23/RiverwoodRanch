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
