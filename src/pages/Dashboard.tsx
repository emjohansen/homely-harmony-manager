import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { House, ShoppingCart, CalendarClock, ClipboardList, Refrigerator } from "lucide-react";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome to Your Household</h1>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/recipes")}
          >
            <House className="h-8 w-8" />
            <span>Recipes</span>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/shopping")}
          >
            <ShoppingCart className="h-8 w-8" />
            <span>Shopping</span>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/reminders")}
          >
            <CalendarClock className="h-8 w-8" />
            <span>Reminders</span>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/chores")}
          >
            <ClipboardList className="h-8 w-8" />
            <span>Chores</span>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-2 col-span-2"
            onClick={() => navigate("/storage")}
          >
            <Refrigerator className="h-8 w-8" />
            <span>Storage</span>
          </Button>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Dashboard;