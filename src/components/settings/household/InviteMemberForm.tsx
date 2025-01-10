import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

interface InviteMemberFormProps {
  onInvite: (email: string) => Promise<void>;
}

export const InviteMemberForm = ({ onInvite }: InviteMemberFormProps) => {
  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="email"
        placeholder="Enter email address"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
      />
      <Button onClick={() => onInvite(inviteEmail)}>
        <Mail className="h-4 w-4" />
      </Button>
    </div>
  );
};