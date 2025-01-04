import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecipeHeaderProps {
  canEdit: boolean;
  recipeId: string;
  handleDelete: () => void;
  title: string;
}

export const RecipeHeader = ({ canEdit, recipeId, handleDelete, title }: RecipeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4 relative">
      <Button
        variant="ghost"
        onClick={() => navigate("/recipes")}
        className="flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-foreground">
        {title}
      </h1>
      
      {canEdit && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/recipes/${recipeId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};