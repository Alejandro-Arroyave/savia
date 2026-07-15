import { GraphQLError } from "graphql";
import type { Context } from "../context.js";
import type { User } from "@prisma/client";

/** Exige un usuario autenticado o lanza un error GraphQL 401. */
export function requireUser(ctx: Context): User {
  if (!ctx.user) {
    throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
  }
  return ctx.user;
}
