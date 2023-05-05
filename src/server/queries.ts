import HttpError from "@wasp/core/HttpError.js";
import type { Tank, Game, User, PlayerInGame } from "@wasp/entities";
import { assert } from "console";

export async function getTank(args: any, context: any): Promise<Tank> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  return await context.entities.Tank.findMany({
    where: { creatorId: context.user.id },
  });
}

export async function getGame(args: any, context: any): Promise<Game | null> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  // Find games where user playsIn
  const games = await context.entities.Game.findMany({
    where: {
      players: {
        some: {
          userId: context.user.id
        }
      }
    },
  });
  
  if (games.length == 0) {
    return Promise.resolve(null);
  } else {
    return games[0];
  }
}

export const getFOV = async ({}, context: any) => {
  // TODO add validations

  // get user game
  const game = await context.entities.Game.findUnique({
    where: {
      id: context.user.gameId,
    },
  });

  // check who turn it is
  const curr_turn = await context.entities.Turn.findFirst({
    where: { 
      gameId: game.id,
      current: true
    },
    select: {
      user: true
    }
  })

  console.log(curr_turn)
  console.log(context.user)

  if (curr_turn.user.id != context.user.id) {
    return {}
  } else {
    return {
      width: 40,
      height: 40,
      position: {
        q: 0,
        r: 0,
      },
      fov: [
        { q: 0, r: 0, kind: "plain", ontop: "" },
        { q: 0, r: -1, kind: "plain", ontop: "" },
        { q: 1, r: -1, kind: "plain", ontop: "" },
        { q: -1, r: 0, kind: "plain", ontop: "" },
        { q: 1, r: 0, kind: "plain", ontop: "" },
        { q: -1, r: 1, kind: "plain", ontop: "" },
        { q: 0, r: 1, kind: "plain", ontop: "" },
      ],
    };
  }
};


export const getState = async ({}, context: any): Promise<[Game, PlayerInGame]> => {
  // TODO change this to be on the URL
  // get user game
  // 

  console.log("Getting state")
  const games = await context.entities.Game.findMany({
    where: {
      players: {
        some: {
          userId: context.user.id
        }
      }
    },
  });
  
  assert(games.length == 1, "User should be in exactly one game");
  const game = games[0];
  
  const playeringame = await context.entities.PlayerInGame.findFirst({
    where: {
      gameId: game.id,
      userId: context.user.id
    }
  })
  
  console.log(playeringame)
  
  return [game, playeringame]
}
