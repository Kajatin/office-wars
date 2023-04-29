import HttpError from "@wasp/core/HttpError.js";
import type { Tank } from "@wasp/entities";

export async function addTank(tank: Tank, context: any) {
  console.log(tank, context);

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
  if (tank.agility + tank.armor + tank.accuracy + tank.attackPower > 20) {
    throw new HttpError(
      400,
      "Total of tank's stats must be less than or equal to 20."
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

  await context.entities.Tank.delete({ where: { id: tankId } });

  return true;
}
