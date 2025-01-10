import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface MemberCardProps {
  username: string;
  role: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export const MemberCard = ({ username, role, onRemove, showRemoveButton }: MemberCardProps) => {
  return (
    <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow">
      <div>
        <p className="font-medium">{username || 'Unknown User'}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
      {showRemoveButton && onRemove && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};