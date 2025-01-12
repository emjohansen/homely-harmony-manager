import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ShoppingListHeaderProps {
  list: {
    name: string;
    creator?: {
      username: string | null;
    };
  } | null;
  totalPrice: number;
}

export const ShoppingListHeader = ({ list, totalPrice }: ShoppingListHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/shopping')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Lists
      </Button>

      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-semibold">{list?.name}</h1>
        <p className="text-sm text-gray-500">
          Created by {list?.creator?.username || 'Unknown'}
        </p>
        {totalPrice > 0 && (
          <div className="mt-2 text-lg font-semibold">
            Total: {totalPrice} kr
          </div>
        )}
      </div>
    </>
  );
};