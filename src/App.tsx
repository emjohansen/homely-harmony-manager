import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Recipes from "@/pages/Recipes";
import NewRecipe from "@/pages/NewRecipe";
import RecipeDetails from "@/pages/RecipeDetails";
import EditRecipe from "@/pages/EditRecipe";
import Shopping from "@/pages/Shopping";
import ShoppingListDetail from "@/pages/ShoppingListDetail";
import Chores from "@/pages/Chores";
import Reminders from "@/pages/Reminders";
import Storage from "@/pages/Storage";
import Settings from "@/pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/new" element={<NewRecipe />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />
        <Route path="/recipes/:id/edit" element={<EditRecipe />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/shopping/list/:id" element={<ShoppingListDetail />} />
        <Route path="/chores" element={<Chores />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;