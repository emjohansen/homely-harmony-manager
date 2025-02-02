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
  const [activeTab, setActiveTab] = useState<"private" | "public">("private");
  const { privateRecipes, publicRecipes, loading } = useRecipes();
  const [hasHousehold, setHasHousehold] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHouseholdMembership = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_household')
          .eq('id', session.user.id)
          .single();

        if (profile?.current_household) {
          const { data: household } = await supabase
            .from('households')
            .select('members')
            .eq('id', profile.current_household)
            .single();

          setHasHousehold(household?.members?.includes(session.user.id) || false);
        } else {
          setHasHousehold(false);
        }
      }
    };

    checkHouseholdMembership();
  }, []);

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div 
        className="relative h-[40vh] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("/lovable-uploads/7e24e64e-7cc7-4287-8a2e-41e46382fd65.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Utensils className="absolute opacity-10 h-64 w-64 text-cream transform -translate-y-8" />
        <h1 className="relative text-5xl font-bold mb-4 text-cream uppercase tracking-wider">RECIPES</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-8 text-forest">Loading recipes...</div>
        ) : (
          <Tabs 
            defaultValue="private" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value as "private" | "public")}
          >
            <TabsList className="grid w-full grid-cols-2 overflow-visible bg-cream p-0 [&_[data-state=active]]:bg-sage [&_[data-state=active]]:text-cream [&_[data-state=active]]:border-sage [&_[data-state=active]]:border [&_[data-state=active]]:border-b [&_[data-state=inactive]]:border-sage [&_[data-state=inactive]]:border [&_[data-state=inactive]]:border-b">
              <TabsTrigger value="private" className="text-forest text-sm h-[42px]">My Recipes</TabsTrigger>
              <TabsTrigger value="public" className="text-forest text-sm h-[42px]">All Recipes</TabsTrigger>
            </TabsList>
            <TabsContent value="private" className="w-full">
              {!hasHousehold ? (
                <div className="text-center py-8 text-forest">
                  Join or select a household to start adding your own recipes!
                </div>
              ) : privateRecipes.length === 0 ? (
                <div className="text-center py-8 text-forest">
                  No recipes yet. Add your first recipe!
                </div>
              ) : (
                <RecipeList recipes={privateRecipes} />
              )}
            </TabsContent>
            <TabsContent value="public" className="w-full">
              {publicRecipes.length === 0 ? (
                <div className="text-center py-8 text-forest">
                  No public recipes available.
                </div>
              ) : (
                <RecipeList recipes={publicRecipes} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Button
        onClick={() => navigate("/recipes/new")}
        className="fixed bottom-[5%] right-[-2rem] w-32 h-32 rounded-full bg-sage hover:bg-mint transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center border-none"
        size="icon"
      >
        <p className="font-bold text-[95px] text-cream group-hover:text-forest leading-none flex items-center justify-center translate-y-[-1.5rem] translate-x-[-0.625rem]">+</p>
      </Button>
      
      <Navigation />
    </div>
  );
};

export default Recipes;