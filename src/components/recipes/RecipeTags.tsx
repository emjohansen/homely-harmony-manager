import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipeTagsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  handleAddTag: (e: React.KeyboardEvent) => void;
}

const TAG_CATEGORIES = {
  mealType: {
    label: "Måltidstype",
    options: ["Frokost", "Lunsj", "Middag", "Dessert", "Snacks", "Drikke"]
  },
  difficulty: {
    label: "Vanskelighetsgrad",
    options: ["Enkel", "Middels", "Avansert"]
  },
  allergens: {
    label: "Allergener",
    options: ["Glutenfri", "Laktosefri", "Nøttefri", "Eggfri", "Vegansk", "Vegetarisk"]
  },
  meatType: {
    label: "Kjøtttype",
    options: ["Kylling", "Storfe", "Svin", "Lam", "Fisk", "Skalldyr"]
  },
  misc: {
    label: "Annet",
    options: ["Sunn", "Rask", "Budsjettvennlig", "Festmat", "Tradisjonell", "Internasjonal"]
  }
};

export const RecipeTags = ({
  tags,
  setTags,
  newTag,
  setNewTag,
  handleAddTag,
}: RecipeTagsProps) => {
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectTag = (category: string, value: string) => {
    if (!tags.includes(value)) {
      setTags([...tags, value]);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Tagger</Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {Object.entries(TAG_CATEGORIES).map(([key, category]) => (
          <div key={key} className="space-y-2">
            <Label className="text-sm text-gray-500">{category.label}</Label>
            <Select onValueChange={(value) => handleSelectTag(key, value)}>
              <SelectTrigger>
                <SelectValue placeholder={`Velg ${category.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {category.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Eller skriv en egen tagg og trykk Enter"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
        />
      </div>
    </div>
  );
};