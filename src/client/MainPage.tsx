import logout from "@wasp/auth/logout";
import { User } from "@wasp/entities";
import TankCustomizer from "./components/TankCustomizer";

export default function MainPage({ user }: { user: User }) {
  return (
    <div className="flex flex-col">
      <button onClick={logout}>Logout</button>
      <TankCustomizer user={user} />
    </div>
  );
}
