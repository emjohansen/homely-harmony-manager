import { Tag } from "lucide-react";
import { RecipeTag } from "@/types/recipe";

interface RecipeTagsProps {
  tags: RecipeTag[];
}

export const RecipeTagsDisplay = ({ tags }: RecipeTagsProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        <span className="text-sm font-medium">Tagger</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(({ tag }) => (
          <span
            key={tag}
            className="bg-white px-3 py-1 rounded-full text-xs font-medium
                     border border-border border-opacity-20 transition-all duration-300
                     hover:border-opacity-100"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};