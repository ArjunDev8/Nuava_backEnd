import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import { createServer } from "http";
import { Server } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import cors from "cors";
import compression from "compression";
import schema from "./schema";
import { prisma } from "./db";

const app = express();
const httpServer = createServer(app);

async function startApolloServer(schema: any) {
  const wsServer = new Server({
    server: httpServer,
    path: "/graphql",
  });
  // Passing in an instance of a GraphQLSchema and
  // telling the WebSocketServer to start listening
  const serverCleanup = useServer(
    {
      schema,
      onConnect(ctx) {
        console.log("connected", ctx.connectionParams);
        //console.log("connected!", ctx.connectionParams);
        return ctx.connectionParams;
      },
      async onDisconnect(ctx, code, reason) {
        console.log("disconnected", code, reason);
      },
      async onClose(ctx, code, reason) {
        console.log("closed", code, reason);
      },

      context: (ctx, msg, args) => {
        // Returning an object here will add that information to our
        console.log("context", ctx);
      },
    },

    wsServer
  );

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    // validationRules: [depthLimit(7)],
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    compression(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        let auth = req?.headers?.authorization?.split(" ")[1];
        return {
          // pubsub,
          auth,
        };
      },
    })
  );
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 3000 }, async () => {
      // DB connect console log
      prisma.$connect().then(() => {
        console.log("🚀 Database connected");
      });
      resolve();
    })
  );
  console.log(`🚀 Server ready at http://localhost:${3000}/graphql`);
}
startApolloServer(schema);
