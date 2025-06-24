import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { Upload, CloudUpload } from "lucide-react";
import { useDropzone } from "react-dropzone";

const uploadSchema = insertProjectSchema.extend({
  technologies: z.string().optional(),
  codeFile: z.any(),
  previewImage: z.any().optional(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "",
      technologies: "",
      terms: false
    }
  });

  // Debug: log form errors on every render
  console.log("❗Form Errors:", errors);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const removeFile = (file: File) => {
    setFiles(prev => prev.filter(f => f !== file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("category", data.category);
      formData.append("technologies", data.technologies || "");
      files.forEach(file => formData.append("files", file));

      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Project uploaded!",
        description: "Your project is being verified and will be available soon."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/seller"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: UploadFormData) => {
    console.log("🚀 Form Submitted:", data); // Debug log
    if (files.length === 0) {
      toast({
        title: "File required",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }
    try {
      await uploadMutation.mutateAsync(data);
    } catch (error) {
      uploadMutation.reset();
    }
  };

  // Handler for invalid form
  const onInvalid = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Please fix the form errors",
      description: "Some fields are invalid or missing.",
      variant: "destructive",
    });
    console.warn("⚠️ Form validation failed:", errors);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Project</DialogTitle>
          <DialogDescription>
            Fill in your project details and upload your files (like GitHub).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, () => {
          toast({
            title: "Please fix the form errors",
            description: "Some fields are invalid or missing.",
            variant: "destructive",
          });
          console.warn("⚠️ Form validation failed:", errors);
        })} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="title" className="flex items-center gap-1">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="title" 
                placeholder="My Project" 
                {...register("title")}
                className={`text-black ${errors.title ? "border-red-500 text-red-600" : ""}`} 
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe your project..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">Mobile Apps</SelectItem>
                    <SelectItem value="web">Web Apps</SelectItem>
                    <SelectItem value="ai">AI & ML</SelectItem>
                    <SelectItem value="games">Games</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="99.00"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <Label>Project Code (ZIP file)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFiles(prev => [...prev, file]);
                  }}
                  className="hidden"
                  id="codeFile"
                />
                <label htmlFor="codeFile" className="cursor-pointer">
                  <CloudUpload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">
                    {files.length > 0 ? files[0].name : "Click to upload ZIP file"}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <Label>Preview Image/Video (optional)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFiles(prev => [...prev, file]);
                  }}
                  className="hidden"
                  id="previewImage"
                />
                <label htmlFor="previewImage" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">
                    {files.length > 1 ? files[1].name : "Click to upload preview"}
                  </p>
                </label>
              </div>
            </div>

            {/* Technologies */}
            <div>
              <Label htmlFor="technologies">Technologies Used</Label>
              <Input
                id="technologies"
                placeholder="React, Node.js, MongoDB (comma separated)"
                {...register("technologies")}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={watch("terms")}
                onCheckedChange={(val) => {
                  setValue("terms", !!val);
                  trigger("terms");
                }}
                className={errors.terms ? "border-red-500" : ""}
              />
              <div className="flex flex-col">
                <Label htmlFor="terms" className="flex items-center gap-1">
                  I agree to the terms <span className="text-red-500">*</span>
                </Label>
                {errors.terms && (
                  <p className="text-red-600 text-sm mt-1">{errors.terms.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
