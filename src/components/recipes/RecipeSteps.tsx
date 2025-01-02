import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

  return (
    <div className="space-y-2">
      <Label>Fremgangsmåte</Label>
      {steps.map((step, index) => (
        <div key={index} className="flex gap-2 items-start">
          <span className="mt-2 text-sm text-gray-500">{index + 1}.</span>
          <Textarea
            placeholder={`Steg ${index + 1}`}
            value={step.description}
            onChange={(e) => handleStepChange(index, e.target.value)}
          />
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