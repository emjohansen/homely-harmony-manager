import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TAG_CATEGORIES } from "../recipe-constants";

interface RecipeFiltersProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  onRandomRecipe: () => void;
}

export const RecipeFilters = ({
  selectedTags,
  onTagToggle,
  onClearFilters,
  onRandomRecipe,
}: RecipeFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 mt-4 w-[300px] mx-auto">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="flex-1 bg-mint hover:bg-sage text-forest hover:text-cream"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
        <Button
          onClick={onRandomRecipe}
          className="flex-1 bg-mint hover:bg-sage text-forest hover:text-cream"
        >
          Random Recipe
        </Button>
      </div>

      {selectedTags.length > 0 && (
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="text-sm text-forest"
        >
          Reset Filters
        </Button>
      )}

      {showFilters && (
        <div className="mb-6">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {Object.entries(TAG_CATEGORIES).map(([key, category]) => (
              <AccordionItem key={key} value={key} className="border rounded-lg bg-mint shadow-sm">
                <AccordionTrigger className="px-4">
                  <span className="text-sm font-semibold text-forest">{category.label}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {category.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-${key}-${option}`}
                          checked={selectedTags.includes(option)}
                          onCheckedChange={() => onTagToggle(option)}
                        />
                        <label
                          htmlFor={`filter-${key}-${option}`}
                          className="text-sm cursor-pointer text-forest"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="bg-mint text-forest px-2 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                onClick={() => onTagToggle(tag)}
                className="ml-1 text-forest hover:text-sage"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};