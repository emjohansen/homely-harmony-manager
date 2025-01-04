import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      console.error('Error signing in:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="font-dongle text-8xl font-bold text-gray-900">
          Welcome to Lovable
        </h1>
        
        <p className="font-dongle text-4xl text-gray-600">
          Your all-in-one solution for managing your household tasks, recipes, and more.
        </p>

        <div className="pt-8">
          <Button 
            onClick={handleSignIn}
            size="lg"
            className="text-xl px-8 py-6"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;