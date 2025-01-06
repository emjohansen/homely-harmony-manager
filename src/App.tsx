import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import { useNewUserCheck } from "@/hooks/use-new-user-check";

const ProtectedRoute = ({ children, allowSettings = false }: { children: React.ReactNode, allowSettings?: boolean }) => {
  const { isLoading, SetupDialog } = useNewUserCheck(allowSettings);
  
  if (isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {SetupDialog}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/recipes" element={
          <ProtectedRoute>
            <Recipes />
          </ProtectedRoute>
        } />
        <Route path="/recipes/new" element={
          <ProtectedRoute>
            <NewRecipe />
          </ProtectedRoute>
        } />
        <Route path="/recipes/:id" element={
          <ProtectedRoute>
            <RecipeDetails />
          </ProtectedRoute>
        } />
        <Route path="/recipes/:id/edit" element={
          <ProtectedRoute>
            <EditRecipe />
          </ProtectedRoute>
        } />
        <Route path="/shopping" element={
          <ProtectedRoute>
            <Shopping />
          </ProtectedRoute>
        } />
        <Route path="/shopping/list/:id" element={
          <ProtectedRoute>
            <ShoppingListDetail />
          </ProtectedRoute>
        } />
        <Route path="/chores" element={
          <ProtectedRoute>
            <Chores />
          </ProtectedRoute>
        } />
        <Route path="/reminders" element={
          <ProtectedRoute>
            <Reminders />
          </ProtectedRoute>
        } />
        <Route path="/storage" element={
          <ProtectedRoute>
            <Storage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowSettings={true}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/meal-planner" element={
          <ProtectedRoute>
            <MealPlanner />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;