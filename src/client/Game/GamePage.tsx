import logout from "@wasp/auth/logout";
import { User } from "@wasp/entities";

export default function GamePage({ user }: { user: User }) {
  return (
    <div className="flex flex-col">
      <button onClick={logout}>Logout</button>
      <h1>Demo</h1>
    </div>
  );
}
