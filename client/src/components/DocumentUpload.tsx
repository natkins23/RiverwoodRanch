
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { CloudUpload, Upload } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertDocumentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const uploadFormSchema = z.object({
  title: z.string().min(1, "Title is required").min(3, "Title must be at least 3 characters"),
  type: z.string().min(1, "Document type is required"),
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  file: z.instanceof(File, { message: "Please select a file" }).refine(file => file.size > 0, "Please select a file")
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

export default function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
    },
    mode: "onSubmit"
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/documents", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      form.reset();
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = async (data: UploadFormValues) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("type", data.type);
      formData.append("description", data.description);
      formData.append("file", data.file, data.file.name);
      
      uploadMutation.mutate(formData);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      form.setValue("file", e.target.files[0], { shouldValidate: true });
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      form.setValue("file", e.dataTransfer.files[0], { shouldValidate: true });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter document title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="bylaw">Bylaw</SelectItem>
                  <SelectItem value="financial">Financial Document</SelectItem>
                  <SelectItem value="minutes">Meeting Minutes</SelectItem>
                  <SelectItem value="map">Property Map</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="file"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Document File</FormLabel>
              <FormControl>
                <div 
                  className={`border border-dashed rounded-md p-6 text-center bg-gray-50 ${
                    isDragging ? 'border-[#2C5E1A] bg-[#2C5E1A]/5' : 'border-gray-300'
                  } cursor-pointer`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('documentFile')?.click()}
                >
                  <div className="space-y-2">
                    <CloudUpload className="mx-auto text-gray-400" size={24} />
                    <p className="text-sm text-gray-500">
                      Drag and drop your file here, or click to select
                    </p>
                    <p className="text-xs text-gray-400">
                      Supported formats: PDF, DOC, DOCX (Max 25MB)
                    </p>
                    {value && (
                      <p className="text-sm text-[#2C5E1A] mt-2">
                        Selected file: {(value as File).name}
                      </p>
                    )}
                  </div>
                  <input
                    id="documentFile"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileInputChange}
                    {...fieldProps}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the document" 
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-[#2C5E1A] hover:bg-[#4C8033]"
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Document"
          )}
        </Button>
      </form>
    </Form>
  );
}
