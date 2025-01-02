import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recipes from "@/pages/Recipes";
import NewRecipe from "@/pages/NewRecipe";
import RecipeDetails from "@/pages/RecipeDetails";
import EditRecipe from "@/pages/EditRecipe";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recipes />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/new" element={<NewRecipe />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />
        <Route path="/recipes/:id/edit" element={<EditRecipe />} />
      </Routes>
    </Router>
  );
};

export default App;
