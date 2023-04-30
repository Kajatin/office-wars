import HttpError from "@wasp/core/HttpError.js";
import type { Tank, Game, User } from "@wasp/entities";

export async function getTank(args: any, context: any): Promise<Tank> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  return await context.entities.Tank.findUnique({
    where: { userId: context.user.id },
  });
}

export async function getGame(args: any, context: any): Promise<Game | null> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  if (!context.user.gameId) {
    return Promise.resolve(null);
  }

  return await context.entities.Game.findUnique({
    where: { id: context.user.gameId },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          tank: { select: { color: true } },
        },
      },
      board: {
        select: {
          id: true,
          state: true
        }
      }
    },
  });
}

export const turnPolling = ({gameId}, context) => {
    return context.entities.Turn.findUnique({
        where: { 
          gameId: gameId,
          current: true
        },
        select: {
          user: true
        }
    })
}

export const getFOV = async ({}, context) => {
  // TODO add validations

  // get user game
  const game = await context.entities.Game.findUnique({
    where: {
      id: context.user.gameId
    }
  })

  console.log(game)

  return {
    width: 40,
    height: 40,
    position: {
      q:0, r:0
    },
    fov: [
      { q: 0, r: 0, kind: "plain", ontop: ""},
      { q: 0, r: -1, kind: "plain", ontop: ""},
      { q: 1, r: -1, kind: "plain", ontop: ""},
      { q: -1, r: 0, kind: "plain", ontop: ""},
      { q: 1, r: 0, kind: "plain", ontop: ""},
      { q: -1, r: 1, kind: "plain", ontop: ""},
      { q: 0, r: 1, kind: "plain", ontop: ""},
    ]
  } 
}


