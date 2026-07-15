import "dotenv/config"; // carga apps/api/.env antes que nada
import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema/index.js";
import { createContext } from "./context.js";

const port = Number(process.env.PORT ?? 4000);

const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: "/graphql",
  landingPage: false,
});

const server = createServer(yoga);

server.listen(port, () => {
  console.log(`🌿 Savia API lista en http://localhost:${port}/graphql`);
});
