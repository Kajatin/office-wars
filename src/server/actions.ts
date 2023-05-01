import HttpError from "@wasp/core/HttpError.js";
import type { Tank, Game, User } from "@wasp/entities";

export async function addTank(tank: Tank, context: any) {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  if (
    !tank ||
    !tank.agility ||
    !tank.armor ||
    !tank.accuracy ||
    !tank.attackPower ||
    !tank.color
  ) {
    throw new HttpError(
      400,
      "Tank must have agility, armor, accuracy, attackPower, and color."
    );
  }

  // Ensure that the total of the tank's stats is less than or equal to 20.
  const sum = tank.agility + tank.armor + tank.accuracy + tank.attackPower;
  if (sum > 20 || sum < 0) {
    throw new HttpError(
      400,
      "Total of tank's stats must be less than or equal to 20 and greater than 0."
    );
  }

  // Add the tank to the database.
  await context.entities.Tank.create({
    data: {
      agility: tank.agility,
      armor: tank.armor,
      accuracy: tank.accuracy,
      attackPower: tank.attackPower,
      color: tank.color,
      creatorId: context.user.id,
    },
  });

  return true;
}

export async function updateTank(tank: Tank, context: any) {
  throw new HttpError(500, "Not implemented");
}

export async function removeTank(tankId: number, context: any) {
  throw new HttpError(500, "Not implemented");
}

function generateRandomString() {
  let result = "";
  for (let i = 0; i < 4; i++) {
    // Generate a random number between 0 and 25, and add it to 65 to get a character code for A-Z
    let charCode = Math.floor(Math.random() * 26) + 65;
    result += String.fromCharCode(charCode);
  }
  return result.toUpperCase();

}


// 1 - plains
// 2 - water
// 3 - sand
// 4 - rock
// 5 - mountain
// 6 - forest

// generate rectangular grid with q,r hexagon coordinates
function generateGrid() {
  const grid = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 3, 3, 3, 3, 1, 1],
    [1, 3, 2, 2, 3, 1, 1],
    [1, 3, 2, 2, 3, 1, 1],
    [1, 3, 3, 3, 3, 1, 1],
    [6, 6, 6, 1, 1, 1, 1],
    [6, 6, 6, 1, 5, 5, 5],
  ];
  
  return grid;
}

export async function generateGame(args: any, context: any) {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  const game = await context.entities.Game.create({
    data: {
      code: generateRandomString(),
      adminId: context.user.id,
      started_at: new Date(),
    },
  });
  
  const grid = generateGrid();

  const board_state = {
    grid: grid,
    turn: 0,
  }

  await context.entities.Board.create({
    data: {
      gameId: game.id,
      state: JSON.stringify(board_state),
    },
  });
}

export async function abandonGame(args: any, context: any) {
  throw new HttpError(500, "Not implemented");
}

export async function joinGame(
  gameCode: string,
  tankId: number,
  context: any
): Promise<boolean> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  if (!gameCode || !tankId) {
    throw new HttpError(400, "You must provide details");
  }

  // Ensure that the game exists and is in the lobby state.
  const game = await context.entities.Game.findUnique({
    where: { code: gameCode },
  });

  if (!game) {
    throw new HttpError(404, "Game not found.");
  }

  if (game.state !== "lobby") {
    throw new HttpError(400, 'Game is not in the "lobby" state.');
  }
  
  // Ensure that the user is not already in a game and that they have a tank.
  const playerInGame = await context.entities.PlayerInGame.findUnique({
    where: {
      userId_gameId: {
        userId: context.user.id,
        gameId: game.id,
      }
    }
  });
  
  if (playerInGame) {
    throw new HttpError(400, "You are already in this game.");
  }
  
  // check how many players are in the game
  const players = await context.entities.PlayerInGame.findMany({
    where: { gameId: game.id },
  });
  
  const player_state = {
    fov: [],
    visited_tiles: [],
  }
  
  // TODO check that the tank is from the player
  await context.entities.PlayerInGame.create({
    data: {
        order: players.length,
        userId: context.user.id,
        gameId: game.id,
        state: JSON.stringify(player_state),
        tankId: tankId,
    },
  });

  return true;
}

export async function launchGame(
  gameId: number,
  context: any
): Promise<boolean> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  if (!gameId) {
    throw new HttpError(400, "You must provide a game ID.");
  }

  // Ensure that the user is not already in a game and that they have a tank.
  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  if (!user.gameId || user.gameId !== gameId) {
    throw new HttpError(403, "You are not part of this game.");
  }

  // Ensure that the game exists and is in the lobby state.
  const game = await context.entities.Game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new HttpError(404, "Game not found.");
  }

  if (game.state !== "lobby") {
    throw new HttpError(400, 'Game is not in the "lobby" state.');
  }

  const game_updated = await context.entities.Game.update({
    where: { id: gameId },
    data: {
      state: "playing",
      started_at: new Date(),
    },
    select: {
      id: true,
      users: true,
    },
  });

  game_updated.users.forEach(async (user: User) => {
    const q = Math.floor(Math.random() * 10) + 1;
    const r = Math.floor(Math.random() * 10) + 1;
    const move = {
      action: "spawn",
      q: q,
      r: r,
    };
    await context.entities.Turn.create({
      data: {
        gameId: game_updated.id,
        userId: user.id,
        move: JSON.stringify(move),
        ended_at: new Date(),
        current: false,
      },
    });
  });

  const first_turn = {
    gameId: game_updated.id,
    userId: user.id,
    move: JSON.stringify({}),
    current: true,
  };
  await context.entities.Turn.create({
    data: first_turn,
  });

  return true;
}

export const nextTurn = async () => {
  console.log('The client said Hi!')
}
