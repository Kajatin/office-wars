import HttpError from "@wasp/core/HttpError.js";
import type { Tank, Game } from "@wasp/entities";

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
      userId: context.user.id,
    },
  });

  return true;
}

export async function updateTank(tank: Tank, context: any) {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  // Ensure the player is not in a game.
  const game = await context.entities.Game.findFirst({
    where: { users: { some: { id: context.user.id } } },
  });

  if (game && game.state !== "lobby") {
    throw new HttpError(
      403,
      "You cannot update a tank while you are in a game."
    );
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
  await context.entities.Tank.update({
    where: { id: tank.id, userId: context.user.id },
    data: {
      agility: tank.agility,
      armor: tank.armor,
      accuracy: tank.accuracy,
      attackPower: tank.attackPower,
      color: tank.color,
    },
  });

  return true;
}

export async function removeTank(tankId: number, context: any) {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to remove a tank.");
  }

  const tank = await context.entities.Tank.findUnique({
    where: { id: tankId },
  });

  if (!tank) {
    throw new HttpError(404, "Tank not found.");
  }

  if (tank.userId !== context.user.id) {
    throw new HttpError(403, "You can only remove your own tanks.");
  }

  const game = await context.entities.Game.findFirst({
    where: { users: { some: { id: context.user.id } } },
  });

  if (game) {
    throw new HttpError(
      403,
      "You cannot remove a tank while you are in a game."
    );
  }

  await context.entities.Tank.delete({ where: { id: tankId } });

  return true;
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

export async function generateGame(args: any, context: any): Promise<Game> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  // Ensure that the user is not already in a game and that they have a tank.
  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
    include: { tank: true },
  });

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  if (user.gameId) {
    throw new HttpError(403, "You are already in a game.");
  }

  if (!user.tank) {
    throw new HttpError(403, "You must have a tank to generate a game.");
  }

  const gameCode = generateRandomString();

  const game = await context.entities.Game.create({
    data: {
      code: gameCode,
      users: {
        connect: {
          id: context.user.id,
        },
      },
    },
  });

  return game;
}

export async function abandonGame(args: any, context: any): Promise<boolean> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  await context.entities.User.update({
    where: { id: context.user.id },
    data: {
      gameId: null,
    },
  });

  return true;
}

export async function joinGame(
  gameCode: string,
  context: any
): Promise<boolean> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  if (!gameCode) {
    throw new HttpError(400, "You must provide a game ID.");
  }

  // Ensure that the user is not already in a game and that they have a tank.
  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
    include: { tank: true },
  });

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  if (user.gameId) {
    throw new HttpError(403, "You are already in a game.");
  }

  if (!user.tank) {
    throw new HttpError(403, "You must have a tank to generate a game.");
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

  await context.entities.Game.update({
    where: { code: gameCode },
    data: {
      users: {
        connect: {
          id: context.user.id,
        },
      },
    },
  });

  return true;
}
