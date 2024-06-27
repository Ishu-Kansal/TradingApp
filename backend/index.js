import { ApolloServer } from "apollo-server";
import typeDefs from "./src/schema/type-defs.js";
import resolvers from "./src/schema/resolvers.js";

const port = process.env.APOLLO_SERVER_PORT;

const server = new ApolloServer({ resolvers, typeDefs });

server.listen({ port }, () =>
  console.log(`Server runs at: http://localhost:${port}`)
);
