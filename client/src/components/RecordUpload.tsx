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
  type: z.string().min(1, "Record type is required"),
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  visibility: z.string().min(1, "Visibility is required"),
  file: z.instanceof(File, { message: "Please select a file" }).refine(file => file.size > 0, "Please select a file")
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface RecordUploadProps {
  accessLevel?: 'user' | 'admin';
}

export default function RecordUpload({ accessLevel = 'admin' }: RecordUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      visibility: accessLevel === 'admin' ? "admin" : "protected",
    },
    mode: "onSubmit"
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/records", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      form.reset();
      toast({
        title: "Record uploaded",
        description: "Your record has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload record. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = async (data: UploadFormValues) => {
    try {
      if (!data.file) {
        throw new Error('No file selected');
      }
      
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("type", data.type);
      formData.append("description", data.description);
      formData.append("visibility", data.visibility);
      formData.append("file", data.file);
      
      uploadMutation.mutate(formData);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
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
              <FormLabel>Record Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter record title" {...field} />
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
              <FormLabel>Record Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
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
              <FormLabel>Record File</FormLabel>
              <FormControl>
                <div 
                  className={`border border-dashed rounded-md p-6 text-center bg-gray-50 ${
                    isDragging ? 'border-[#2C5E1A] bg-[#2C5E1A]/5' : 'border-gray-300'
                  } cursor-pointer`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('recordFile')?.click()}
                >
                  <div className="space-y-2">
                    <CloudUpload className="mx-auto text-gray-400" size={24} />
                    <p className="text-sm text-gray-500">
                      Drag and drop your file here, or click to select
                    </p>
                    <p className="text-xs text-gray-400">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF (Max 25MB)
                    </p>
                    {value && (
                      <p className="text-sm text-[#2C5E1A] mt-2">
                        Selected file: {(value as File).name}
                      </p>
                    )}
                  </div>
                  <input
                    id="recordFile"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
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
                  placeholder="Brief description of the record" 
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Record Visibility</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={accessLevel !== 'admin'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public (Visible to All)</SelectItem>
                  <SelectItem value="protected">Protected (Passcode Access: 7796)</SelectItem>
                  <SelectItem value="admin">Admin Only (Passcode Access: 7799)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {accessLevel === 'admin' 
                  ? "Select who can view this record" 
                  : "Only admin users can change record visibility"}
              </p>
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
            "Upload"
          )}
        </Button>
      </form>
    </Form>
  );
}