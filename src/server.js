require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");

const typeDefs = require("./graphql/typedefs");
const resolvers = require("./graphql/resolvers");

const start = async (typeDefs, resolvers) => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();
  app.use(cors());
  server.applyMiddleware({ app, path: "/" || "/graphql" });

  await mongoose.connect(process.env.MONGO_URI);
  console.log("\n🌳 Connected to MongoDB");

  app.listen(4000, console.log("🚀 Server started on http://localhost:4000\n"));
};

start(typeDefs, resolvers);
