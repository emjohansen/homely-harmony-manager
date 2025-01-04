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
    <div className="flex justify-between w-[300px] mx-auto mb-6">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="flex-1 mx-1"
      >
        {showFilters ? "Hide filters" : "Filter"}
      </Button>
      <Button
        variant="outline"
        onClick={clearFilters}
        className="flex-1 mx-1"
        disabled={selectedTags.length === 0}
      >
        Reset
      </Button>
    </div>
  );
};