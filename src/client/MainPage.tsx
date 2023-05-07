import { User } from "@wasp/entities";

import { useState } from "react";

import GameHandler from "./components/GameHandler";
import TankCustomizer from "./components/TankCustomizer";

export default function MainPage({ user }: { user: User }) {
  const [tankId, setTankId] = useState<number | null>(null);

  return (
    <div className="flex flex-col md:flex-row gap-10 md:gap-24">
      <div className="flex max-w-sm">
        <TankCustomizer user={user} setTankId={setTankId} />
      </div>
      <div className="flex max-w-sm">
        <GameHandler user={user} tankId={tankId} />
      </div>
    </div>
  );
}
