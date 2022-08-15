require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");

const tokenDecoderMiddleware = require("./middleware/decodedToken");

const typeDefs = require("./graphql/typedefs");
const resolvers = require("./graphql/resolvers");
const context = require("./graphql/context");

(async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });
  await server.start();

  app.use(tokenDecoderMiddleware);
  server.applyMiddleware({ app, path: "/" || "/graphql" });

  await mongoose.connect(process.env.MONGO_URI);
  console.log("\n🌳 Connected to MongoDB");

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, console.log("🚀 Server started on http://localhost:4000\n"));
})();
