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
    <div className="mb-4">
      <div className="flex items-center justify-between relative">
        <Button
          variant="ghost"
          onClick={() => navigate("/recipes")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
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
      
      <h1 className="text-center text-xl font-bold text-foreground mt-4">
        {title}
      </h1>
    </div>
  );
};