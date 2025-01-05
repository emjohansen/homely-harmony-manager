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
import MealPlanner from "@/pages/MealPlanner";
import Onboarding from "@/pages/Onboarding";
import RequireHousehold from "@/components/household/RequireHousehold";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/dashboard"
          element={
            <RequireHousehold>
              <Dashboard />
            </RequireHousehold>
          }
        />
        <Route
          path="/recipes"
          element={
            <RequireHousehold>
              <Recipes />
            </RequireHousehold>
          }
        />
        <Route
          path="/recipes/new"
          element={
            <RequireHousehold>
              <NewRecipe />
            </RequireHousehold>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <RequireHousehold>
              <RecipeDetails />
            </RequireHousehold>
          }
        />
        <Route
          path="/recipes/:id/edit"
          element={
            <RequireHousehold>
              <EditRecipe />
            </RequireHousehold>
          }
        />
        <Route
          path="/shopping"
          element={
            <RequireHousehold>
              <Shopping />
            </RequireHousehold>
          }
        />
        <Route
          path="/shopping/list/:id"
          element={
            <RequireHousehold>
              <ShoppingListDetail />
            </RequireHousehold>
          }
        />
        <Route
          path="/chores"
          element={
            <RequireHousehold>
              <Chores />
            </RequireHousehold>
          }
        />
        <Route
          path="/reminders"
          element={
            <RequireHousehold>
              <Reminders />
            </RequireHousehold>
          }
        />
        <Route
          path="/storage"
          element={
            <RequireHousehold>
              <Storage />
            </RequireHousehold>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/meal-planner"
          element={
            <RequireHousehold>
              <MealPlanner />
            </RequireHousehold>
          }
        />
      </Routes>
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;