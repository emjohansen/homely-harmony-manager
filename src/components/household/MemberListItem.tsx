import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface MemberListItemProps {
  username: string | null;
  role: string;
  canDelete: boolean;
  onDelete: () => void;
}

export function MemberListItem({ username, role, canDelete, onDelete }: MemberListItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
      <div>
        <p className="font-medium">{username}</p>
        <p className="text-sm text-gray-500 capitalize">{role}</p>
      </div>
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}