import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import typeDefs from "./schemaGql.js";
import mongoose from "mongoose";
import { JWT_SECRET, MONGO_URI } from "./config.js";
import jwt from "jsonwebtoken";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log("Error Connecting", err);
});

// import models here
import "./models/User.js";
import "./models/Quotes.js";
import resolvers from "./resolvers.js";

// This is middleware
const context = ({ req }) => {
  // we have token in our authorization req.headers
  const { authorization } = req.headers;
  if (authorization) {
    const { userId } = jwt.verify(authorization, JWT_SECRET);
    return { userId: userId };
  }
};

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  // this context acts as middleware meaning, it will be called after client
  // calls any resolver, before reaching to resolver.
  context: context,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

// default port is 4000
server.listen().then(({ url }) => console.log(`Server Ready at ${url}`));
