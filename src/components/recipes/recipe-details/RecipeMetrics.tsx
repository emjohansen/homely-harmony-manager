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
    <div className="grid grid-cols-3 gap-1.5">
      <div className="bg-white rounded-lg p-2 flex flex-col items-center justify-center text-center
                    border border-border border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Users className="h-3.5 w-3.5 mb-0.5" />
        <p className="text-[10px] text-muted-foreground">Porsjoner</p>
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onServingsChange(-1)}
            disabled={currentServings <= 1}
            className="h-5 w-5"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium w-4 text-center">
            {currentServings}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onServingsChange(1)}
            className="h-5 w-5"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 flex flex-col items-center justify-center text-center
                    border border-border border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Clock className="h-3.5 w-3.5 mb-0.5" />
        <p className="text-[10px] text-muted-foreground">Tid</p>
        <p className="text-xs font-medium">{preparationTime} min</p>
      </div>

      <div className="bg-white rounded-lg p-2 flex flex-col items-center justify-center text-center
                    border border-border border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Scale className="h-3.5 w-3.5 mb-0.5" />
        <p className="text-[10px] text-muted-foreground">Enheter</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleUnits}
          className="text-[10px] font-medium hover:bg-accent hover:text-accent-foreground h-5 px-1"
        >
          {showAlternativeUnits ? "Metrisk" : "US"}
        </Button>
      </div>
    </div>
  );
};