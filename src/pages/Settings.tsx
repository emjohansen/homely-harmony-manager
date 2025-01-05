import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, UserPlus, UserMinus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Household {
  id: string;
  name: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  useEffect(() => {
    checkUser();
    fetchHouseholds();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      return;
    }
    setUserEmail(session.user.email);
    
    // Fetch the user's current nickname
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, current_household')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.username) {
      setNickname(profile.username);
    }
  };

  const fetchHouseholds = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all households the user is a member of
    const { data: memberHouseholds } = await supabase
      .from('household_members')
      .select('household_id, households:household_id(id, name)')
      .eq('user_id', user.id);

    if (memberHouseholds) {
      const households = memberHouseholds.map(mh => ({
        id: mh.households.id,
        name: mh.households.name
      }));
      setHouseholds(households);

      // Get current household
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .single();

      if (profile?.current_household) {
        const current = households.find(h => h.id === profile.current_household);
        setCurrentHousehold(current || null);
      }
    }
  };

  const handleUpdateNickname = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({ username: nickname })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your nickname has been updated.",
      });
    } catch (error) {
      console.error('Error updating nickname:', error);
      toast({
        title: "Error",
        description: "Failed to update nickname. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHousehold = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create new household
      const { data: household, error: createError } = await supabase
        .from('households')
        .insert([{ name: newHouseholdName, created_by: user.id }])
        .select()
        .single();

      if (createError) throw createError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: household.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) throw memberError;

      // Set as current household
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setNewHouseholdName("");
      setIsDialogOpen(false);
      fetchHouseholds();
      
      toast({
        title: "Success",
        description: "Household created successfully.",
      });
    } catch (error) {
      console.error('Error creating household:', error);
      toast({
        title: "Error",
        description: "Failed to create household. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInviteMember = async (householdId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('household_invites')
        .insert([{
          household_id: householdId,
          email: inviteEmail,
          invited_by: user.id
        }]);

      if (error) throw error;

      setInviteEmail("");
      setIsInviteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Invitation sent successfully.",
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveHousehold = async (householdId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If leaving current household, clear it
      if (currentHousehold?.id === householdId) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ current_household: null })
          .eq('id', user.id);

        if (updateError) throw updateError;
        setCurrentHousehold(null);
      }

      fetchHouseholds();
      
      toast({
        title: "Success",
        description: "Left household successfully.",
      });
    } catch (error) {
      console.error('Error leaving household:', error);
      toast({
        title: "Error",
        description: "Failed to leave household. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSelectHousehold = async (household: Household) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id);

      if (error) throw error;

      setCurrentHousehold(household);
      
      toast({
        title: "Success",
        description: "Active household updated.",
      });
    } catch (error) {
      console.error('Error updating active household:', error);
      toast({
        title: "Error",
        description: "Failed to update active household. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Account Settings Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              {userEmail && (
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">
                  Nickname
                </Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your nickname"
                />
              </div>

              <Button 
                onClick={handleUpdateNickname}
                disabled={isLoading}
                className="w-full bg-sage hover:bg-mint text-cream"
              >
                {isLoading ? "Updating..." : "Update Nickname"}
              </Button>
            </div>
          </div>

          {/* Household Management Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Household Management</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Active Household
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {currentHousehold?.name || "Select a household"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full min-w-[240px]">
                    {households.map((household) => (
                      <DropdownMenuItem
                        key={household.id}
                        className="flex items-center justify-between"
                        onClick={() => handleSelectHousehold(household)}
                      >
                        <span>{household.name}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsInviteDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeaveHousehold(household.id);
                            }}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Create New Household Button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Household
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Household</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="householdName">Household Name</Label>
                      <Input
                        id="householdName"
                        value={newHouseholdName}
                        onChange={(e) => setNewHouseholdName(e.target.value)}
                        placeholder="Enter household name"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateHousehold}
                      className="w-full"
                    >
                      Create Household
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Invite Member Dialog */}
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <Button 
                      onClick={() => currentHousehold && handleInviteMember(currentHousehold.id)}
                      className="w-full"
                    >
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Sign Out Button */}
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full"
          >
            Sign out
          </Button>
        </div>
      </div>
      <Navigation />
    </div>
  );
}