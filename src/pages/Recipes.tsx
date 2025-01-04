import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeList } from "@/components/recipes/RecipeList";
import { useRecipes } from "@/hooks/use-recipes";

const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"private" | "public">("private");
  
  const { privateRecipes, publicRecipes, loading, refetch } = useRecipes(currentHouseholdId);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      } else {
        const { data: householdMember } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        console.log("Current household member:", householdMember);
        if (householdMember) {
          setCurrentHouseholdId(householdMember.household_id);
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-forest">
      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(45deg, #1e251c 30%, #9dbc98 100%)",
        }}
      >
        <Utensils className="absolute opacity-10 h-64 w-64 text-cream transform -translate-y-8" />
        <h1 className="relative text-6xl font-bold mb-4 text-cream uppercase tracking-wider font-averia">RECIPES</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-24">
        <Tabs
          defaultValue="private"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "private" | "public")}
        >
          <TabsList className="grid w-full grid-cols-2 overflow-visible bg-cream p-0 [&_[data-state=active]]:bg-sage [&_[data-state=active]]:text-cream [&_[data-state=active]]:border-sage [&_[data-state=active]]:border [&_[data-state=active]]:border-b [&_[data-state=inactive]]:bg-mint [&_[data-state=inactive]]:border-sage [&_[data-state=inactive]]:border [&_[data-state=inactive]]:border-b">
            <TabsTrigger value="private" className="text-forest font-averia text-[18px] h-[42px]">My Recipes</TabsTrigger>
            <TabsTrigger value="public" className="text-forest font-averia text-[18px] h-[42px]">All Recipes</TabsTrigger>
          </TabsList>
          <TabsContent value="private" className="w-full">
            {!currentHouseholdId ? (
              <div className="text-center py-8">
                <p className="text-cream mb-4">Join or create a household to start adding recipes!</p>
                <Button onClick={() => navigate("/settings")} variant="outline">
                  Go to Settings
                </Button>
              </div>
            ) : (
              <RecipeList recipes={privateRecipes} />
            )}
          </TabsContent>
          <TabsContent value="public" className="w-full">
            <RecipeList recipes={publicRecipes} />
          </TabsContent>
        </Tabs>
      </div>

      <Button
        onClick={() => navigate("/recipes/new")}
        className="fixed bottom-[5%] right-[-2rem] w-32 h-32 rounded-full bg-sage hover:bg-mint transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center border-none"
        size="icon"
      >
        <p className="font-averia font-bold text-[120px] text-cream group-hover:text-forest leading-none flex items-center justify-center translate-x-[-1rem]">+</p>
      </Button>
      
      <Navigation />
    </div>
  );
};

export default Recipes;
