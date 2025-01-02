import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageCompression";
import { useToast } from "@/hooks/use-toast";

interface RecipeImageUploadProps {
  imageUrl: string | null;
  onImageUpload: (url: string) => void;
}

export const RecipeImageUpload = ({ imageUrl, onImageUpload }: RecipeImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setUploading(true);

      const file = event.target.files[0];
      const compressedFile = await compressImage(file);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);

      onImageUpload(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Recipe Image</Label>
      {imageUrl && (
        <div className="relative w-full h-48 mb-4">
          <img
            src={imageUrl}
            alt="Recipe"
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
        </div>
      )}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="recipe-image"
          disabled={uploading}
        />
        <Label
          htmlFor="recipe-image"
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4 mr-2" />
            )}
            {imageUrl ? "Change Image" : "Upload Image"}
          </Button>
        </Label>
      </div>
    </div>
  );
};