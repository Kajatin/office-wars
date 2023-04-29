import HttpError from "@wasp/core/HttpError.js";
import type { Tank } from "@wasp/entities";

export async function getTank(args: any, context: any): Promise<Tank> {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to add a tank.");
  }

  return await context.entities.Tank.findUnique({
    where: { userId: context.user.id },
  });
}
