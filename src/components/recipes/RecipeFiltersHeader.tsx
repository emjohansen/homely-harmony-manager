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
    <div className="grid grid-cols-2 gap-4 w-[300px] mx-auto mb-6">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="w-full"
      >
        {showFilters ? "Skjul filter" : "Filter"}
      </Button>
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
        disabled={selectedTags.length === 0}
      >
        Nullstill
      </Button>
    </div>
  );
};