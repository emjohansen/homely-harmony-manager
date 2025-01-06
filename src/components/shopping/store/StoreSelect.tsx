import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoreSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  stores: string[];
  onAddStoreClick: () => void;
}

export const StoreSelect = ({
  value,
  onValueChange,
  stores,
  onAddStoreClick,
}: StoreSelectProps) => {
  const handleAddStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddStoreClick();
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-32 border-sage border">
        <SelectValue placeholder="Select store" />
      </SelectTrigger>
      <SelectContent className="bg-[#efffed] z-50">
        {stores.map((store) => (
          <SelectItem key={store} value={store}>
            {store}
          </SelectItem>
        ))}
        <div className="px-2 py-1.5">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start text-left text-sm"
            onClick={handleAddStoreClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add store
          </Button>
        </div>
      </SelectContent>
    </Select>
  );
};