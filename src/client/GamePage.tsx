import { useHistory, useLocation } from "react-router-dom";
import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { User } from "@wasp/entities";
import { useQuery } from "@wasp/queries";

import ArenaP5 from "./components/ArenaP5";

import logout from "@wasp/auth/logout";
import getState from "@wasp/queries/getState";
import actionInGame from "@wasp/actions/actionInGame";
import LoadingSpinner from "./components/LoadingSpinner";

export default function GamePage({ user }: { user: User }) {
  const history = useHistory();

  // Parse query params
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const gameId = parseInt(params.get("id") || "");

  const {
    data: state,
    isFetching,
    error,
  } = useQuery(getState, { gameId: gameId });
  const [selectedHex, setSelectedHex] = useState(null);

  return (
    <>
      <div className="flex w-screen h-screen pt-14 px-3">
        <div className="w-full h-full">
          {isFetching ? (
            <LoadingSpinner />
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <Arena state={state} setSelectedHex={setSelectedHex} />
          )}
        </div>
      </div>

      <GameAction state={state} selectedHex={selectedHex} />

      <div className="fixed top-0 w-full border-b bg-white shadow-sm">
        <div className="flex flex-row px-4 py-2 justify-between font-medium text-2xl items-center">
          <div className="flex flex-row gap-1">
            <div>
              {user.username}{" "}
              <span className="opacity-60 font-normal text-xl">
                (#{user.id})
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-1">
            <button
              className="flex self-center opacity-60 hover:opacity-100"
              onClick={() => {
                history.push("/");
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <button
              className="flex self-center opacity-60 hover:opacity-100"
              onClick={logout}
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Arena(props: { state: any; setSelectedHex: (hex: any) => void }) {
  const { state, setSelectedHex } = props;

  return (
    <ArenaP5
      game={state?.[0]}
      tank={state?.[1].tank}
      fov={state?.[1].state}
      setSelectedHex={setSelectedHex}
    />
  );
}

function GameAction(props: { state: any; selectedHex: any | null }) {
  const { state, selectedHex } = props;

  return (
    <AnimatePresence>
      {selectedHex && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.2 }}
          className="fixed top-16 left-5 bg-white bg-opacity-80 rounded-lg border-[3px] border-stone-500 px-3 py-2 w-[14rem] max-w-[14rem]"
        >
          <div className="flex flex-col justify-center items-center gap-2">
            <svg
              className="w-12 h-w-12 self-center py-1"
              style={{ color: selectedHex.props.color }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 726 628"
            >
              <polygon
                points="723,314 543,625.769145 183,625.769145 3,314 183,2.230855 543,2.230855 723,314"
                fill="currentColor"
                stroke="#333333"
                strokeWidth="40"
              />
            </svg>

            <div className="font-semibold w-full text-center pb-1">
              {selectedHex.props.kind}
            </div>

            <button
              onClick={async () =>
                await actionInGame({
                  gameID: state[0].id,
                  action: {
                    action: "move",
                    info: { q: selectedHex.q, r: selectedHex.r },
                  },
                })
              }
              className="w-full px-8 rounded border border-stone-500 font-medium text-sm hover:bg-indigo-50 hover:border-indigo-400 py-1 text-stone-700 hover:text-indigo-600 transition-all duration-300"
            >
              <div className="flex flex-row gap-1 justify-center items-center">
                <span>Move</span>
                <span className="material-symbols-outlined self-center">
                  right_click
                </span>
              </div>
            </button>

            <button className="w-full px-8 rounded border border-stone-500 font-medium text-sm hover:bg-indigo-50 hover:border-indigo-400 py-1 text-stone-700 hover:text-indigo-600 transition-all duration-300">
              <div className="flex flex-row gap-1 justify-center items-center">
                <span>Attack</span>
                <span className="material-symbols-outlined self-center">
                  swords
                </span>
              </div>
            </button>

            <button className="w-full px-8 rounded border border-stone-500 font-medium text-sm hover:bg-indigo-50 hover:border-indigo-400 py-1 text-stone-700 hover:text-indigo-600 transition-all duration-300">
              <div className="flex flex-row gap-1 justify-center items-center">
                <span>Bunker Down</span>
                <span className="material-symbols-outlined self-center">
                  shield
                </span>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
