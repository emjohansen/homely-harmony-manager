import { Button } from "@/components/ui/button";
import { Minus, Plus, Clock, Users, Scale } from "lucide-react";

interface RecipeMetricsProps {
  currentServings: number;
  onServingsChange: (delta: number) => void;
  preparationTime: number | null;
  showAlternativeUnits: boolean;
  onToggleUnits: () => void;
}

export const RecipeMetrics = ({
  currentServings,
  onServingsChange,
  preparationTime,
  showAlternativeUnits,
  onToggleUnits,
}: RecipeMetricsProps) => {
  return (
    <div className="flex justify-between items-start px-4 bg-mint rounded-md p-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
          <Users className="h-3 w-3" />
          <span className="text-[10px]">Servings</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onServingsChange(-1)}
            disabled={currentServings <= 1}
            className="h-5 w-5 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium w-4 text-center">
            {currentServings}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onServingsChange(1)}
            className="h-5 w-5 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
          <Clock className="h-3 w-3" />
          <span className="text-[10px]">Time</span>
        </div>
        <p className="text-xs font-medium">{preparationTime} min</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
          <Scale className="h-3 w-3" />
          <span className="text-[10px]">Units</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleUnits}
          className="text-[10px] font-medium h-5 px-2 border-primary hover:bg-primary/10"
        >
          {showAlternativeUnits ? "US" : "Metric"}
        </Button>
      </div>
    </div>
  );
};