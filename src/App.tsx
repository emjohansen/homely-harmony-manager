import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recipes from "@/pages/Recipes";
import NewRecipe from "@/pages/NewRecipe";
import RecipeDetails from "@/pages/RecipeDetails";
import EditRecipe from "@/pages/EditRecipe";
import Shopping from "@/pages/Shopping";
import Reminders from "@/pages/Reminders";
import Chores from "@/pages/Chores";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recipes />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/new" element={<NewRecipe />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />
        <Route path="/recipes/:id/edit" element={<EditRecipe />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/chores" element={<Chores />} />
      </Routes>
    </Router>
  );
};

export default App;