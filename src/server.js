require("dotenv").config();
const express = require("express");
const { ApolloServer, ApolloError } = require("apollo-server-express");
const mongoose = require("mongoose");

const morgan = require("morgan");
const tokenDecoderMiddleware = require("./middleware/decodedToken");

const typeDefs = require("./graphql/typedefs");
const resolvers = require("./graphql/resolvers");
const context = require("./graphql/context");

const start = async (typeDefs, resolvers) => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });
  await server.start();

  app.use(morgan("dev"));
  app.use(tokenDecoderMiddleware);
  server.applyMiddleware({ app, path: "/" || "/graphql" });

  await mongoose.connect(process.env.MONGO_URI);
  console.log("\n🌳 Connected to MongoDB");

  app.listen(4000, console.log("🚀 Server started on http://localhost:4000\n"));
};

start(typeDefs, resolvers);
