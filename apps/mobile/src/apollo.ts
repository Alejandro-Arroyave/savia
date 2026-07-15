import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import Constants from "expo-constants";

// Puerto del servidor GraphQL de Savia (ver apps/api/.env → PORT).
const API_PORT = 4001;

// URL de la API. Prioridad:
//   1) EXPO_PUBLIC_GRAPHQL_URL (override manual)
//   2) IP LAN de la máquina de desarrollo (para probar en un dispositivo real / simulador)
//   3) localhost (fallback)
const explicitUrl =
  process.env.EXPO_PUBLIC_GRAPHQL_URL ??
  (Constants.expoConfig?.extra?.graphqlUrl as string | undefined);
const lanHost = Constants.expoConfig?.hostUri?.split(":")[0];
const graphqlUrl =
  explicitUrl ??
  (lanHost ? `http://${lanHost}:${API_PORT}/graphql` : `http://localhost:${API_PORT}/graphql`);

if (__DEV__) {
  console.log(`[apollo] endpoint GraphQL: ${graphqlUrl}`);
}

const httpLink = createHttpLink({ uri: graphqlUrl });

// Registra errores de red y de GraphQL en la consola (visibles en Metro / RN DevTools).
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (!__DEV__) return;
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.warn(`[graphql] ${operation.operationName}: ${err.message}`, err.extensions);
    }
  }
  if (networkError) {
    console.warn(`[network] ${operation.operationName}: ${networkError.message}`);
  }
});

// Credenciales en runtime. Las setea la capa de auth (AuthContext).
let accessToken: string | null = null;
let devUserEmail: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// Modo desarrollo sin Auth0: identifica al usuario por email (ver apps/api/src/context.ts).
export function setDevUserEmail(email: string | null): void {
  devUserEmail = email;
}

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    ...(!accessToken && devUserEmail ? { "x-dev-user-email": devUserEmail } : {}),
  },
}));

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
