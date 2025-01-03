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
    <div className="grid grid-cols-3 gap-2 mt-6">
      <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center text-center
                    border border-border border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Users className="h-4 w-4 mb-1" />
        <p className="text-xs text-muted-foreground mb-1">Porsjoner</p>
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onServingsChange(-1)}
            disabled={currentServings <= 1}
            className="h-6 w-6"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">
            {currentServings}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onServingsChange(1)}
            className="h-6 w-6"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center text-center
                    border border-border border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Clock className="h-4 w-4 mb-1" />
        <p className="text-xs text-muted-foreground mb-1">Tilberedningstid</p>
        <p className="text-sm font-medium">{preparationTime} min</p>
      </div>

      <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center text-center
                    border border-border border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Scale className="h-4 w-4 mb-1" />
        <p className="text-xs text-muted-foreground mb-1">Måleenheter</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleUnits}
          className="text-xs font-medium hover:bg-accent hover:text-accent-foreground h-6 px-2"
        >
          {showAlternativeUnits ? "Vis metrisk" : "Vis amerikansk"}
        </Button>
      </div>
    </div>
  );
};