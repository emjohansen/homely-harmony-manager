import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeList } from "@/components/recipes/RecipeList";
import { useRecipes } from "@/hooks/use-recipes";
import type { Recipe } from "@/types/recipe";

const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
  
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

  const getRandomRecipe = (recipes: Recipe[]) => {
    if (recipes.length === 0) {
      toast({
        title: "Ingen oppskrifter",
        description: "Ingen oppskrifter tilgjengelig i denne kategorien!",
      });
      return;
    }
    const randomIndex = Math.floor(Math.random() * recipes.length);
    navigate(`/recipes/${recipes[randomIndex].id}`);
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Oppskrifter</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/recipes/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Ny oppskrift
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Laster oppskrifter...</div>
        ) : (
          <Tabs defaultValue="private" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="private">Mine</TabsTrigger>
                <TabsTrigger value="public">Alle</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => getRandomRecipe(privateRecipes)}
                  title="Tilfeldig oppskrift"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Tilfeldig
                </Button>
              </div>
            </div>
            <TabsContent value="private">
              {!currentHouseholdId ? (
                <div className="text-center py-8 text-gray-500">
                  Bli med i en husholdning for å begynne å legge til dine egne oppskrifter!
                </div>
              ) : privateRecipes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Ingen oppskrifter enda. Legg til din første oppskrift!
                </div>
              ) : (
                <RecipeList recipes={privateRecipes} />
              )}
            </TabsContent>
            <TabsContent value="public">
              <div className="flex justify-end items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => getRandomRecipe(publicRecipes)}
                  title="Tilfeldig oppskrift"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Tilfeldig
                </Button>
              </div>
              {publicRecipes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Ingen offentlige oppskrifter tilgjengelig.
                </div>
              ) : (
                <RecipeList recipes={publicRecipes} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      <Navigation />
    </div>
  );
};

export default Recipes;