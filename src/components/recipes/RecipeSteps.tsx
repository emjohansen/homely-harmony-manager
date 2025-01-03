import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ListChecks } from "lucide-react";

interface RecipeStepsProps {
  steps: Array<{ description: string }>;
  setSteps: (steps: Array<{ description: string }>) => void;
}

export const RecipeSteps = ({ steps, setSteps }: RecipeStepsProps) => {
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    setSteps([...steps, { description: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ListChecks className="h-4 w-4" />
        <Label className="text-lg font-semibold">Fremgangsmåte</Label>
      </div>
      {steps.map((step, index) => (
        <div key={index} className="flex gap-2 items-start">
          <span className="mt-2 text-sm text-gray-500">{index + 1}.</span>
          <Textarea
            placeholder={`Steg ${index + 1}`}
            value={step.description}
            onChange={(e) => handleStepChange(index, e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveStep(index)}
            className="mt-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddStep}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Legg til steg
      </Button>
    </div>
  );
};