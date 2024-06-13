import { makeExecutableSchema } from "@graphql-tools/schema";
import "graphql-import-node";
import { GraphQLSchema } from "graphql";
import { allResolvers } from "../resolvers";
import root from "./schema.graphql";
import student from "./student.graphql";
import coach from "./coach.graphql";
import tournament from "./tournament.graphql";

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [root, student, coach, tournament],
  resolvers: allResolvers,
});

export default schema;
