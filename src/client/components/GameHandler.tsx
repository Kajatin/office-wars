import { User } from "@wasp/entities";
import { useQuery } from "@wasp/queries";

import { useEffect, useState } from "react";

import LoadingSpinner from "./LoadingSpinner";

import getGame from "@wasp/queries/getGame";
import getUsersForGame from "@wasp/queries/getUsersForGame";
import joinGame from "@wasp/actions/joinGame";
import abandonGame from "@wasp/actions/abandonGame";
import generateGame from "@wasp/actions/generateGame";

export default function TankCustomizer(props: { user: User }) {
  const { user } = props;
  const { data: game, isFetching, error } = useQuery(getGame);

  const [code, setCode] = useState("");
  const [numPlayers, setNumPlayers] = useState(0);

  useEffect(() => {
    setNumPlayers(0);
  }, [game]);

  return (
    <div className="flex flex-col flex-grow min-w-[24rem] gap-2 w-full h-full sm:w-fit justify-center px-4 py-2">
      <div className="flex justify-between font-medium text-3xl py-1 border-b items-baseline">
        <span className="text-indigo-500">Game Lobby</span>
        <span className="text-base font-normal opacity-70">
          {numPlayers} player{numPlayers === 1 ? "" : "s"}
        </span>
      </div>
      {isFetching ? (
        <LoadingSpinner />
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : game ? (
        <div className="flex flex-col gap-2 py-3 justify-center content-center">
          <PlayerLobby setNumPlayers={setNumPlayers} />

          <div className="w-full mt-2 text-center uppercase text-2xl rounded border font-medium bg-indigo-50 border-indigo-400 py-1 text-indigo-600">
            {game.code}
          </div>
          <div className="text-sm opacity-70 mb-2">
            Share this code with your friends! They can use it to join your
            lobby.
          </div>

          <button
            className="w-full px-8 bg-white rounded border font-medium hover:bg-indigo-50 hover:border-indigo-400 py-1 text-stone-700 hover:text-indigo-600"
            onClick={() => {}}
          >
            <div className="flex flex-row gap-1 justify-center">
              <span>Launch</span>
              <span className="material-icons self-center">rocket</span>
            </div>
          </button>

          <button
            className="w-full px-8 bg-white rounded border font-medium hover:bg-pink-50 hover:border-pink-400 py-1 text-stone-700 hover:text-pink-600"
            onClick={() => {
              try {
                abandonGame(null);
              } catch (err) {
                console.log(err);
                window.alert(err);
              }
            }}
          >
            <div className="flex flex-row gap-1 justify-center">
              <span>Abandon</span>
              <span className="material-icons self-center">backspace</span>
            </div>
          </button>
        </div>
      ) : (
        <>
          <input
            className="w-full text-center uppercase text-2xl rounded border font-medium hover:bg-indigo-50 hover:border-indigo-400 focus:bg-indigo-50 focus:border-indigo-400 py-1 text-stone-700 hover:text-indigo-600 focus:text-indigo-600 outline-none"
            placeholder="dtyz"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
          ></input>

          <button
            className="w-full px-8 bg-white rounded border font-medium hover:bg-indigo-50 hover:border-indigo-400 py-1 text-stone-700 hover:text-indigo-600"
            onClick={async () => {
              try {
                if (!code) {
                  return;
                }

                await joinGame(code);
                setCode("");
              } catch (err) {
                console.log(err);
                window.alert(err);
              }
            }}
          >
            Join Lobby
          </button>

          <div className="flex items-center my-2">
            <div className="border-b border-stone-400 flex-1 mr-2"></div>
            <span className="text-stone-500 font-medium">OR</span>
            <div className="border-b border-stone-400 flex-1 ml-2"></div>
          </div>

          <button
            className="w-full px-8 bg-white rounded border font-medium hover:bg-indigo-50 hover:border-indigo-400 py-1 text-stone-700 hover:text-indigo-600"
            onClick={async () => {
              try {
                await generateGame(null);
                setCode("");
              } catch (err) {
                console.log(err);
                window.alert(err);
              }
            }}
          >
            New Game
          </button>
        </>
      )}
    </div>
  );
}

function PlayerLobby(props: { setNumPlayers: (numPlayers: number) => void }) {
  const { setNumPlayers } = props;
  const { data: players, isFetching, error } = useQuery(getUsersForGame);

  useEffect(() => {
    if (players) {
      setNumPlayers(players.length);
    } else {
      setNumPlayers(0);
    }
  }, [players]);

  return (
    <div className="flex flex-row gap-1 flex-wrap">
      {isFetching ? (
        <LoadingSpinner />
      ) : error ? (
        <div>Error: {error}</div>
      ) : players ? (
        players?.map((player) => (
          <div
            key={player.id}
            className="flex flex-col items-center justify-center gap-1 animate-bounce"
          >
            <div
              className="w-6 h-6 rounded-full border"
              style={{
                background: player?.tank?.color,
              }}
            ></div>
            <div className="text-xs">{player.username}</div>
          </div>
        ))
      ) : (
        <div>Waiting for players...</div>
      )}
    </div>
  );
}
