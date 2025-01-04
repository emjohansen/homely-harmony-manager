import { X } from "lucide-react";

interface RecipeSelectedTagsProps {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
}

export const RecipeSelectedTags = ({
  selectedTags,
  toggleTag,
}: RecipeSelectedTagsProps) => {
  if (selectedTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {selectedTags.map(tag => (
        <span
          key={tag}
          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center"
        >
          {tag}
          <button
            onClick={() => toggleTag(tag)}
            className="ml-1 text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
};