import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface RecipeVisibilityProps {
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
}

export const RecipeVisibility = ({ isPublic, setIsPublic }: RecipeVisibilityProps) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="recipe-visibility" className="text-sm font-medium">
        Make recipe public
      </Label>
      <Switch
        id="recipe-visibility"
        checked={isPublic}
        onCheckedChange={setIsPublic}
        className="bg-mint data-[state=checked]:bg-mint data-[state=unchecked]:bg-mint"
      />
    </div>
  );
};