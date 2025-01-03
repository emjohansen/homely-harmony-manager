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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center
                    border border-[#9DBC98] border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Users className="h-5 w-5 text-[#638889] mb-2" />
        <p className="text-sm text-[#638889] mb-2">Porsjoner</p>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onServingsChange(-1)}
            disabled={currentServings <= 1}
            className="h-7 w-7 border-[#9DBC98]"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-lg font-medium w-8 text-center text-[#638889]">
            {currentServings}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onServingsChange(1)}
            className="h-7 w-7 border-[#9DBC98]"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center
                    border border-[#9DBC98] border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Clock className="h-5 w-5 text-[#638889] mb-2" />
        <p className="text-sm text-[#638889] mb-2">Tilberedningstid</p>
        <p className="text-lg font-medium text-[#638889]">{preparationTime} min</p>
      </div>

      <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center
                    border border-[#9DBC98] border-opacity-20 transition-all duration-300
                    hover:border-opacity-100">
        <Scale className="h-5 w-5 text-[#638889] mb-2" />
        <p className="text-sm text-[#638889] mb-2">Måleenheter</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleUnits}
          className="text-sm font-medium hover:bg-[#9DBC98] hover:bg-opacity-20 text-[#638889]"
        >
          {showAlternativeUnits ? "Vis metrisk" : "Vis amerikansk"}
        </Button>
      </div>
    </div>
  );
};