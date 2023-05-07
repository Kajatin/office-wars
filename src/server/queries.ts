import HttpError from "@wasp/core/HttpError.js";
import type { Tank, Game, PlayerInGame } from "@wasp/entities";
import { assert } from "console";

export async function getTank(args: any, context: any): Promise<Tank[] | null> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  const tanks = await context.entities.Tank.findMany({
    where: { creatorId: context.user.id },
  });

  if (tanks.length == 0) {
    return null;
  } else {
    return tanks;
  }
}

export async function getGame(
  tankId: number | null,
  context: any
): Promise<any | null> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  if (!tankId) {
    throw new HttpError(400, "You must provide a tankId.");
  }

  // Find games where user playsIn
  const games = await context.entities.Game.findMany({
    where: {
      players: {
        some: {
          userId: context.user.id,
        },
      },
    },
    include: {
      players: {
        include: {
          tank: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  if (games.length == 0) {
    return Promise.resolve(null);
  }

  // Find the game where the user's tank is the tankId
  const game = games.find((game: any) => {
    return game.players.some((player: any) => {
      return player.tank.id == tankId;
    });
  });

  return game || null;
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
      current: true,
    },
    select: {
      user: true,
    },
  });

  console.log(curr_turn);
  console.log(context.user);

  if (curr_turn.user.id != context.user.id) {
    return {};
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

export const getState = async (
  args: {
    gameId: number | null;
  },
  context: any
): Promise<[Game, PlayerInGame]> => {
  const { gameId } = args;

  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  if (!gameId) {
    throw new HttpError(400, "You must provide a gameId.");
  }

  const game = await context.entities.Game.findUnique({
    where: {
      id: gameId,
    },
  });

  if (!game) {
    throw new HttpError(400, "Game does not exist.");
  }

  const playerInGame = await context.entities.PlayerInGame.findFirst({
    where: {
      gameId: game.id,
      userId: context.user.id,
    },
    include: {
      tank: true,
    },
  });

  if (!playerInGame) {
    throw new HttpError(400, "You are not in this game.");
  }

  return [game, playerInGame];
};
