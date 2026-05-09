import { useCurrentUser } from '~/context/UserContext';
import type { ReactElement } from 'react';

export function UserProfile(): ReactElement {
  const { user } = useCurrentUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}
