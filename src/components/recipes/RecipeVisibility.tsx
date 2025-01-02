import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RecipeVisibilityProps {
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
}

export const RecipeVisibility = ({ isPublic, setIsPublic }: RecipeVisibilityProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="public"
        checked={isPublic}
        onCheckedChange={setIsPublic}
      />
      <Label htmlFor="public">Make this recipe public</Label>
    </div>
  );
};