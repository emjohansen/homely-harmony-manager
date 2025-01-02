import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RecipeBasicInfoProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  servings: number;
  setServings: (value: number) => void;
  prepTime: number;
  setPrepTime: (value: number) => void;
}

export const RecipeBasicInfo = ({
  title,
  setTitle,
  description,
  setDescription,
  servings,
  setServings,
  prepTime,
  setPrepTime,
}: RecipeBasicInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Navn på matrett</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beskrivelse</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="servings">Porsjoner</Label>
          <Input
            id="servings"
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prepTime">Tilberedningstid (minutter)</Label>
          <Input
            id="prepTime"
            type="number"
            min="1"
            value={prepTime}
            onChange={(e) => setPrepTime(parseInt(e.target.value))}
            required
          />
        </div>
      </div>
    </>
  );
};
