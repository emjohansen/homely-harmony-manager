import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
    options: [
      "Glutenfri", 
      "Laktosefri", 
      "Nøttefri", 
      "Eggfri", 
      "Soyafri",
      "Melkefri",
      "Sesamfri",
      "Skalldyrfri",
      "Fiskefri",
      "Sellerfri",
      "Sennepfri",
      "Sulfittfri"
    ]
  },
  meatType: {
    label: "Kjøtttype",
    options: [
      "Kylling", 
      "Kalkun",
      "Storfe", 
      "Svin", 
      "Lam", 
      "Fisk", 
      "Skalldyr",
      "Vilt",
      "And"
    ]
  },
  dietType: {
    label: "Kosthold",
    options: [
      "Vegansk",
      "Vegetarisk",
      "Pescetariansk",
      "Ketogen",
      "Lavkarbo",
      "Paleo"
    ]
  },
  misc: {
    label: "Annet",
    options: [
      "Sunn", 
      "Rask", 
      "Budsjettvennlig", 
      "Festmat", 
      "Tradisjonell", 
      "Internasjonal",
      "Grillet",
      "Bakt",
      "Kokt",
      "Stekt",
      "Dampet",
      "Fersk",
      "Sesongbasert",
      "Barnevennlig",
      "Frossen",
      "Matlaging i bulk",
      "Lite oppvask",
      "En-potte rett",
      "Slow cooker",
      "Airfryer",
      "Matpakke"
    ]
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

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      handleRemoveTag(tag);
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(TAG_CATEGORIES).map(([key, category]) => (
          <div key={key} className="p-4 border rounded-lg bg-white shadow-sm">
            <Label className="text-sm font-semibold mb-2">{category.label}</Label>
            <div className="space-y-2">
              {category.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${key}-${option}`}
                    checked={tags.includes(option)}
                    onCheckedChange={() => handleToggleTag(option)}
                  />
                  <label
                    htmlFor={`${key}-${option}`}
                    className="text-sm cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
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