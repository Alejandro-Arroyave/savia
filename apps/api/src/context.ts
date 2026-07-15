import { createRemoteJWKSet, jwtVerify } from "jose";
import type { YogaInitialContext } from "graphql-yoga";
import { prisma } from "./prisma.js";
import type { PrismaClient, User } from "@prisma/client";

export interface Context {
  prisma: PrismaClient;
  /** Usuario autenticado (o null si la petición es anónima). */
  user: User | null;
}

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

// JWKS remoto de Auth0 para validar la firma RS256 del access token.
const jwks =
  AUTH0_DOMAIN != null
    ? createRemoteJWKSet(new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`))
    : null;

/**
 * Valida el Bearer token de Auth0 y resuelve (o crea) el User local.
 * El 'sub' de Auth0 es la llave de identidad (User.auth0Id).
 */
async function resolveUser(authHeader: string | null): Promise<User | null> {
  if (!authHeader?.startsWith("Bearer ") || jwks == null || AUTH0_DOMAIN == null) {
    return null;
  }
  const token = authHeader.slice("Bearer ".length);
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });
    const auth0Id = payload.sub;
    if (!auth0Id) return null;

    const email = typeof payload.email === "string" ? payload.email : `${auth0Id}@placeholder.savia`;
    const name = typeof payload.name === "string" ? payload.name : null;

    // Upsert: la primera vez que un usuario de Auth0 llega, se crea su fila local.
    return await prisma.user.upsert({
      where: { auth0Id },
      update: {},
      create: { auth0Id, email, name },
    });
  } catch {
    return null;
  }
}

export async function createContext(initial: YogaInitialContext): Promise<Context> {
  // Modo desarrollo: si no hay Auth0 configurado, se puede identificar un usuario
  // de prueba con el header 'x-dev-user-email'. NUNCA se activa en producción
  // (basta con definir AUTH0_DOMAIN para desactivarlo).
  if (AUTH0_DOMAIN == null) {
    const devEmail = initial.request.headers.get("x-dev-user-email");
    if (devEmail) {
      const user = await prisma.user.upsert({
        where: { email: devEmail },
        update: {},
        create: { auth0Id: `dev|${devEmail}`, email: devEmail, name: "Usuario de prueba" },
      });
      return { prisma, user };
    }
  }

  const authHeader = initial.request.headers.get("authorization");
  const user = await resolveUser(authHeader);
  return { prisma, user };
}
