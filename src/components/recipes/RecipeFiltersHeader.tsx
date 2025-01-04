import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RecipeFiltersHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedTags: string[];
  clearFilters: () => void;
}

export const RecipeFiltersHeader = ({
  showFilters,
  setShowFilters,
  selectedTags,
  clearFilters,
}: RecipeFiltersHeaderProps) => {
  return (
    <div className="flex gap-4 w-[300px] mx-auto mb-6">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="w-full"
      >
        {showFilters ? "Hide filters" : "Filter"}
      </Button>
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
        disabled={selectedTags.length === 0}
      >
        Reset
      </Button>
    </div>
  );
};