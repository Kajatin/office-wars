import { User } from "@wasp/entities";
import TankCustomizer from "./components/TankCustomizer";

export default function MainPage({ user }: { user: User }) {
  return (
    <div className="flex flex-row gap-4">
      <div className="flex max-w-sm">
        <TankCustomizer user={user} />
      </div>
    </div>
  );
}
