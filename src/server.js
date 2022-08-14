require("dotenv").config();
const express = require("express");
const { ApolloServer, ApolloError } = require("apollo-server-express");
const mongoose = require("mongoose");

const cors = require("cors");
const morgan = require("morgan");
const tokenDecoderMiddleware = require("./middleware/decodedToken");

const typeDefs = require("./graphql/typedefs");
const resolvers = require("./graphql/resolvers");

const start = async (typeDefs, resolvers) => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      req,
      userReq: req.user,
      checkUser: (checkId) => {
        if (!req.user) throw new ApolloError("Unauthorized", "401");
        const { id, adm } = req.user;
        if (id === checkId || adm) return true;
        throw new ApolloError("Unauthorized", "401");
      },
      checkField: (field) => {
        // check if field is email or phone number
        const emailRegex =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const phoneRegex =
          /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}(\-|\s)?[0-9]{4}$/;

        if (emailRegex.test(field)) return "email";
        if (phoneRegex.test(field)) return "phone";

        throw new ApolloError("Invalid credentials", "401");
      },
    }),
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
