const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const express = require("express");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const path = require('path');
const { fileLoader, mergeTypes, mergeResolvers } = require('merge-graphql-schemas')
const mongoose = require('mongoose');
require('dotenv').config();

const db = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
    });
    console.log('DB Connected');
  } catch (error) {
    console.log('DB Connection Error', error);
  }
};

db();

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema/typeDefs')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './schema/resolvers')));

(
  async () => {
    const PORT = 4000;

    const app = express();
    const httpServer = createServer(app);

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const server = new ApolloServer({
      schema,
      context: ({ req }) => ({ req })
    });

    await server.start();
    server.applyMiddleware({ app });

    SubscriptionServer.create(
      { schema, execute, subscribe },
      { server: httpServer, path: server.graphqlPath }
    );

    httpServer.listen(PORT, () => {
      console.log(
        `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
      );
      console.log(
        `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
      );
    });
  })();