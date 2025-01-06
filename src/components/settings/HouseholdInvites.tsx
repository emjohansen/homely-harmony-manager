import { useInvites } from "./invites/useInvites";
import { InvitesList } from "./invites/InvitesList";

export const HouseholdInvites = () => {
  const { pendingInvites, isLoading, handleAcceptInvite, handleDenyInvite } = useInvites();

  if (isLoading) {
    return <div className="text-center">Loading invites...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Household Invites</h2>
      <InvitesList
        invites={pendingInvites}
        onAccept={handleAcceptInvite}
        onDeny={handleDenyInvite}
      />
    </div>
  );
};