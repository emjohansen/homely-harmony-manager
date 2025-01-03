import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TAG_CATEGORIES } from "./RecipeTagCategories";

interface RecipeFiltersProps {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  clearFilters: () => void;
}

export const RecipeFilters = ({
  selectedTags,
  toggleTag,
  showFilters,
  setShowFilters,
  clearFilters,
}: RecipeFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4 bg-palette-light text-palette-dark hover:bg-palette-muted"
        >
          {showFilters ? "Skjul filter" : "Vis filter"}
        </Button>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-sm text-palette-dark hover:text-palette-medium"
          >
            Nullstill filter
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mb-6">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {Object.entries(TAG_CATEGORIES).map(([key, category]) => (
              <AccordionItem 
                key={key} 
                value={key} 
                className="border rounded-2xl bg-palette-light shadow-sm"
              >
                <AccordionTrigger className="px-4 text-palette-dark hover:text-palette-medium">
                  <span className="text-sm font-semibold">{category.label}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {category.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-${key}-${option}`}
                          checked={selectedTags.includes(option)}
                          onCheckedChange={() => toggleTag(option)}
                        />
                        <label
                          htmlFor={`filter-${key}-${option}`}
                          className="text-sm cursor-pointer text-palette-dark"
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
              className="bg-palette-light text-palette-dark px-3 py-1.5 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-2 text-palette-medium hover:text-palette-dark"
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