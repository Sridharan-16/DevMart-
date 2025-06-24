import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "",
      technologies: "",
      terms: false,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      const formData = new FormData();
      
      // Add all form fields
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("category", data.category);
      formData.append("technologies", data.technologies || "");
      
      // Add files
      if (codeFile) {
        formData.append("codeFile", codeFile);
      }
      if (previewImage) {
        formData.append("previewImage", previewImage);
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project uploaded!",
        description: "Your project is being verified and will be available soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/seller"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UploadFormData) => {
    if (!codeFile) {
      toast({
        title: "Code file required",
        description: "Please select a ZIP file containing your project code.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Project Details */}
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="My Awesome Project"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe your project..."
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => form.setValue("category", value)}>
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
                {form.formState.errors.category && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.category.message}
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
                  {...form.register("price")}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.price.message}
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
                  onChange={(e) => setCodeFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="codeFile"
                />
                <label htmlFor="codeFile" className="cursor-pointer">
                  <CloudUpload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">
                    {codeFile ? codeFile.name : "Click to upload ZIP file"}
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
                  onChange={(e) => setPreviewImage(e.target.files?.[0] || null)}
                  className="hidden"
                  id="previewImage"
                />
                <label htmlFor="previewImage" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">
                    {previewImage ? previewImage.name : "Click to upload preview"}
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
                {...form.register("technologies")}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={form.watch("terms")}
                onCheckedChange={(checked) => form.setValue("terms", !!checked)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I confirm that this code is my original work and I have the right to sell it. 
                I understand that it will be automatically verified before listing.
              </Label>
            </div>
            {form.formState.errors.terms && (
              <p className="text-sm text-red-600">
                {form.formState.errors.terms.message}
              </p>
            )}
          </div>

          <div className="flex space-x-3">
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
