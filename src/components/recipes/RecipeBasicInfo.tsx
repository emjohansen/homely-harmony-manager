import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Minus, Plus, FileText, Clock, Users } from "lucide-react";

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
  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, servings + delta);
    setServings(newServings);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4" />
          <Label htmlFor="title" className="text-lg font-semibold">Navn og beskrivelse</Label>
        </div>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Skriv inn navnet på retten"
          required
        />
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beskriv retten"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            <Label htmlFor="servings" className="text-lg font-semibold">Porsjoner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(-1)}
              disabled={servings <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              required
              className="w-20 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            <Label htmlFor="prepTime" className="text-lg font-semibold">Tilberedningstid</Label>
          </div>
          <Input
            id="prepTime"
            type="number"
            min="1"
            value={prepTime}
            onChange={(e) => setPrepTime(parseInt(e.target.value))}
            required
            placeholder="Minutter"
          />
        </div>
      </div>
    </div>
  );
};