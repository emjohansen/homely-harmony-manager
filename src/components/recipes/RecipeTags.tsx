import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface RecipeTagsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  handleAddTag: (e: React.KeyboardEvent) => void;
}

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

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
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
      <Input
        placeholder="Type a tag and press Enter"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleAddTag}
      />
    </div>
  );
};