import HttpError from "@wasp/core/HttpError.js";
import type { Tank, User, PlayerInGame } from "@wasp/entities";
import { assert } from "console";
import { on } from "events";

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
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to update a tank.");
  }

  if (
    !tank ||
    !tank.id ||
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

  // Ensure the tank is not used in any active game
  const tankObj = await context.entities.Tank.findUnique({
    where: { id: tank.id },
    include: {
      usedOn: {
        include: { game: true },
      },
    },
  });

  if (tankObj.creatorId !== context.user.id) {
    throw new HttpError(
      403,
      "You cannot update a tank that you did not create."
    );
  }

  tankObj.usedOn.forEach((playerInGame: any) => {
    if (playerInGame.game.state !== "lobby") {
      throw new HttpError(
        403,
        "You cannot update a tank while you are in a game."
      );
    }
  });

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
    where: { id: tank.id },
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
    include: {
      usedOn: {
        include: { game: true },
      },
    },
  });

  if (!tank) {
    throw new HttpError(404, "Tank not found.");
  }

  if (tank.creatorId !== context.user.id) {
    throw new HttpError(403, "You can only remove your own tanks.");
  }

  if (tank.usedOn.length > 0) {
    throw new HttpError(
      403,
      "You cannot remove a tank that is currently in use."
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

export async function demoAction(args: any, context: any) {
  console.log("demo action");
}

// 0 - plain
// 1 - hill
// 2 - sand
// 3 - water
// 4 - forest
// 5 - mountain

const generateGrid = () => {
  const grid: [number, any][][] = [
    [[5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [3, 0], [3, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [2, 0], [2, 0], [2, 0], [3, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [1, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [1, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0], [5, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0], [5, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [3, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0], [5, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0], [5, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0], [5, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0], [5, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [3, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [3, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [3, 0], [3, 0], [2, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [3, 0], [3, 0], [2, 0], [2, 0], [3, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [0, 0], [0, 0], [1, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [3, 0], [3, 0], [3, 0], [3, 0], [2, 0], [3, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [4, 0], [5, 0]],
    [[5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0], [5, 0]]
  ]

  return grid
}

export async function generateGame(tankId: number | null, context: any) {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  if (!tankId) {
    throw new HttpError(400, "You must provide a tank id.");
  }

  // Ensure that the user owns the tank
  const tank = await context.entities.Tank.findUnique({
    where: { id: tankId },
  });

  if (!tank) {
    throw new HttpError(400, "You must provide a valid tank id.");
  }

  if (tank.creatorId !== context.user.id) {
    throw new HttpError(401, "You must own the tank to generate a game.");
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
  };

  await context.entities.Board.create({
    data: {
      gameId: game.id,
      state: JSON.stringify(board_state),
    },
  });

  await context.entities.PlayerInGame.create({
    data: {
      gameId: game.id,
      userId: context.user.id,
      tankId: tankId,
      order: 0,
    },
  });
}

export async function abandonGame(gameId: number | null, context: any) {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  if (!gameId) {
    throw new HttpError(400, "You must provide a game id.");
  }

  const playerInGame = await context.entities.PlayerInGame.findUnique({
    where: {
      gameId_userId: {
        gameId: gameId,
        userId: context.user.id,
      },
    },
  });

  if (!playerInGame) {
    throw new HttpError(400, "You must be in the game to abandon it.");
  }

  if (playerInGame.userId !== context.user.id) {
    throw new HttpError(401, "You must be in the game to abandon it.");
  }

  await context.entities.PlayerInGame.delete({
    where: {
      id: playerInGame.id,
    },
  });

  return true;
}

export async function joinGame(
  args: {
    gameCode: string;
    tankId: number | null;
  },
  context: any
): Promise<boolean> {
  const { gameCode, tankId } = args;

  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  if (!gameCode || !tankId) {
    throw new HttpError(400, "You must provide details");
  }

  // Ensure that the game exists and is in the lobby state
  const game = await context.entities.Game.findUnique({
    where: { code: gameCode },
  });

  if (!game) {
    throw new HttpError(404, "Game not found.");
  }

  if (game.state !== "lobby") {
    throw new HttpError(400, 'Game is not in the "lobby" state.');
  }

  // Ensure that the user owns the tank
  const tank = await context.entities.Tank.findUnique({
    where: { id: tankId },
  });

  if (!tank) {
    throw new HttpError(400, "You must provide a valid tank id.");
  }

  if (tank.creatorId !== context.user.id) {
    throw new HttpError(401, "You must own the tank to generate a game.");
  }

  // Ensure that the user is not already in a game and that they have a tank
  const playerInGame = await context.entities.PlayerInGame.findUnique({
    where: {
      gameId_userId: {
        gameId: game.id,
        userId: context.user.id,
      },
    },
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
  };

  await context.entities.PlayerInGame.create({
    data: {
      gameId: game.id,
      tankId: tank.id,
      userId: context.user.id,
      order: players.length,
      state: JSON.stringify(player_state),
    },
  });

  return true;
}

export async function launchGame(
  gameId: number,
  context: any
): Promise<number | null> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to generate a game.");
  }

  if (!gameId) {
    throw new HttpError(400, "You must provide a game ID.");
  }

  const playerInGame = await context.entities.PlayerInGame.findUnique({
    where: {
      gameId_userId: {
        gameId: gameId,
        userId: context.user.id,
      },
    },
  });

  if (!playerInGame) {
    throw new HttpError(400, "You must be in the game to launch it.");
  }

  // Ensure that the game exists and is in the lobby state
  const game = await context.entities.Game.findUnique({
    where: { id: playerInGame.gameId },
  });

  if (!game) {
    throw new HttpError(404, "Game not found.");
  }

  if (game.state !== "lobby") {
    throw new HttpError(400, 'Game is not in the "lobby" state.');
  }

  if (game.adminId !== context.user.id) {
    throw new HttpError(400, "You must be the admin to launch the game.");
  }

  const game_updated = await context.entities.Game.update({
    where: { id: gameId },
    data: {
      state: "playing",
      started_at: new Date(),
    },
    select: {
      id: true,
      players: true,
    },
  });

  if (!game_updated) {
    throw new HttpError(500, "Failed to update game state.");
  }

  await spawnPlayers({ gameid: gameId }, context);

  return game_updated?.id || null;
}

export const nextTurn = async () => {
  console.log("The client said Hi!");
};

export const spawnPlayers = async (args: { gameid: number }, context: any) => {
  const { gameid } = args;
  console.log("Spawning players");

  // Olny admins can spawn players and start the game
  assert(context.user, "You must be logged in to spawn players");

  // Get the game the user is admin
  const game = await context.entities.Game.findUnique({
    where: {
      id: gameid,
    },
  });

  // Get all the players in the game
  const players = await context.entities.PlayerInGame.findMany({
    where: {
      gameId: game.id,
    },
    include: {
      tank: true,
      user: true,
    }
  });

  assert(players.length > 0, "There must be at least one player in the game");

  // Get the board
  const board = await context.entities.Board.findFirst({
    where: {
      gameId: game.id,
    },
  });

  assert(board, "There must be a board for the game");

  const player_fovs: { [key: number]: string } = {};

  const grid = JSON.parse(board.state).grid;

  // for each player generate a position on the board and check if it is not a mountain
  players.forEach(async (player: any) => {
    let x = Math.floor(Math.random() * 40);
    let y = Math.floor(Math.random() * 40);
    while (grid[y][x][0] == 5) {
      x = Math.floor(Math.random() * 40);
      y = Math.floor(Math.random() * 40);
    }

    const q = x - Math.floor(y / 2);
    const r = y;
    console.log(
      `Player ${player.id} will spawn at x,y (${x} ${y}) q,r (${q}, ${r})`
    );

    grid[y][x][1] = { id: player.id, color: player.tank.color, username: player.user.username };

    const center = { q: q, r: r };

    const [fov, sideeffects] = calculatefov(grid, center);

    const state = {
      pos: center,
      fov: fov,
      visited_tiles: [],
    };

    console.log(state);

    player_fovs[player.id] = JSON.stringify(state);
  });

  // iterate over player_fovs keys
  for (const [key, value] of Object.entries(player_fovs)) {
    console.log(key, value);
    await context.entities.PlayerInGame.update({
      where: {
        id: Number(key),
      },
      data: {
        state: value,
      },
    });
  }

  // update board state
  await context.entities.Board.update({
    where: {
      id: board.id,
    },
    data: {
      state: JSON.stringify({ grid: grid, turn: 0 }),
    },
  });


  // update game state to playing
  await context.entities.Game.update({
    where: {
      id: game.id,
    },
    data: {
      started_at: new Date(),
      state: "playing",
    },
  });
};

const axial_add = (
  hex: { q: number; r: number },
  vec: { q: number; r: number }
) => {
  return { q: hex.q + vec.q, r: hex.r + vec.r };
};

export const actionInGame = async (
  args: { gameID: number; action: { action: string; info: any } },
  context: any
) => {
  console.log("action in game");

  // get the game
  const game = await context.entities.Game.findFirst({
    where: {
      id: args.gameID,
    },
  });
  assert(game);

  // TODO check if the turn is correct

  // check if the user is in the game
  const player = await context.entities.PlayerInGame.findFirst({
    where: {
      userId: context.user.id,
      gameId: args.gameID,
    },
    include: {
      tank: true,
      user: true,
    }
  });
  assert(player);

  // get the board
  const board = await context.entities.Board.findFirst({
    where: {
      gameId: args.gameID,
    },
  });
  assert(board);

  const action = args.action;
  const player_state = JSON.parse(player.state);
  const action_info = action.info;
  const board_state = JSON.parse(board.state)
  const grid = board_state.grid;

  if (action.action == "move") {
    console.log("move action" + " " + JSON.stringify(action.info));
    // TODO check if the move is valid

    if (game.code == context.user.id as string) {
      throw new HttpError(400, "Not your turn");
    }

    const new_id = context.user.id.toString();

    await context.entities.Game.update({
      where: {
        id: args.gameID,
      },
      data: {
        started_at: new Date(),
        state: "playing",
        code: new_id,
      },
    });

    // re-calculating fov
    const center = action_info;
    const centerx = center.q + Math.floor(center.r / 2);
    const centery = center.r;
    const oldposx = player_state.pos.q + Math.floor(player_state.pos.r / 2);
    const oldposy = player_state.pos.r;
    // update grid
    grid[oldposy][oldposx][1] = 0;
    grid[centery][centerx][1] = { id: player.id, color: player.tank.color, username: player.user.username };

    const [fov, sideeffects] = calculatefov(grid, center);

    // TODO recaclulate fov for other players


    const new_state = {
      ...player_state,
      pos: center,
      fov: fov,
    };

    const new_board_state = { grid: grid, turn: board_state.turn + 1 };


    // update board
    await context.entities.Board.update({
      where: {
        id: board.id,
      },
      data: {
        state: JSON.stringify(new_board_state),
      },
    });


    // update player
    await context.entities.PlayerInGame.update({
      where: {
        id: player.id,
      },
      data: {
        state: JSON.stringify(new_state),
      },
    });
  } else if (action.action = "attack") {
    console.log("move action" + " " + JSON.stringify(action.info));
    const attack_pos = action_info;
    const attackx = attack_pos.q + Math.floor(attack_pos.r / 2);
    const attacky = attack_pos.r;

    const grid_tile = grid[attacky][attackx];

    if (grid_tile[1] != 0) {
      // get the player
      const attacked_player: PlayerInGame = await context.entities.PlayerInGame.findFirst({
        where: {
          id: grid_tile[1].id,
        }
      })

      assert(attacked_player);

      // reduce atttacked player hp
      await context.entities.PlayerInGame.update({
        where: {
          id: attacked_player.id,
        },
        data: {
          hp: attacked_player.hp - 25,
        }
      })
    }
  }
};


const calculatefov = (grid: any, center: any) => {
  let sideeffects: any[] = [];
  let possible_fov: { q: number; r: number; kind: number; ontop: number }[] =
    [];
  const N = 3;
  for (let q = -N; q <= N; q++) {
    const r1 = Math.max(-N, -q - N);
    const r2 = Math.min(N, -q + N);
    for (let r = r1; r <= r2; r++) {
      const new_visible_tile = axial_add(center, { q: q, r: r });
      const x = new_visible_tile.q + Math.floor(new_visible_tile.r / 2);
      const y = new_visible_tile.r;

      let kind = -1;
      let ontop = 0;
      if (x >= 0 && x < 40 && y >= 0 && y < 40) {
        kind = grid[y][x][0];
        ontop = grid[y][x][1];
        if (ontop !== 0) {
          sideeffects.push(ontop);
        }
      }

      possible_fov.push({ ...new_visible_tile, kind: kind, ontop: ontop });
    }
  }


  return [possible_fov, sideeffects];
}