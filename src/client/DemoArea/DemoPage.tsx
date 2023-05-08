import logout from "@wasp/auth/logout";
import { User } from "@wasp/entities";
import { useQuery } from "@wasp/queries";
import getTank from "@wasp/queries/getTank";
import getState from "@wasp/queries/getState";

import spawnPlayers from "@wasp/actions/spawnPlayers";
import demoAction from "@wasp/actions/demoAction";
import actionInGame from "@wasp/actions/actionInGame";

export default function GamePage({ match, user }: { match: any; user: User }) {
  const { data: tank } = useQuery(getTank);

  const gameId = parseInt(match.params.id);
  const { data: state } = useQuery(getState, { gameId: gameId });

  return (
    <div className="flex w-screen flex-col">
      <div className="flex w-screen flex-row gap-4">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () => await spawnPlayers({ gameid: gameId })}
        >
          Spawn Players
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () =>
            await actionInGame({
              gameID: gameId,
              action: '{"action":"move","info":{"q":1,"r":4}}',
            })
          }
        >
          Demo Action
        </button>
      </div>
      <code>
        User:
        <pre>{JSON.stringify(user)}</pre>
      </code>
      <code>
        Tank:
        <pre>{JSON.stringify(tank)}</pre>
      </code>
      <code>
        Game:
        <pre>{JSON.stringify(state)}</pre>
      </code>
    </div>
  );
}
