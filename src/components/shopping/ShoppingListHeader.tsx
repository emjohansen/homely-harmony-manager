import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleBack = () => {
    try {
      navigate('/shopping');
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Error",
        description: "Could not navigate back. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Lists
      </Button>

      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{list?.name || 'Loading...'}</h1>
          <p className="text-sm text-gray-500">
            Created by {list?.creator?.username || 'Unknown'}
          </p>
        </div>
        {totalPrice > 0 && (
          <div className="flex items-center gap-2 text-lg font-semibold mt-2">
            Total: {totalPrice} kr
          </div>
        )}
      </div>
    </>
  );
};