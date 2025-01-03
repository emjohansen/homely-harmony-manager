import { RecipeTag } from "@/types/recipe";

interface RecipeTagsProps {
  tags: RecipeTag[];
}

export const RecipeTagsDisplay = ({ tags }: RecipeTagsProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1 justify-center">
      {tags.map(({ tag }) => (
        <span
          key={tag}
          className="bg-white px-1.5 py-0.5 rounded-full text-[9px] font-medium
                   border border-border border-opacity-20 transition-all duration-300
                   hover:border-opacity-100"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};