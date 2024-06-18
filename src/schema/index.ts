import { makeExecutableSchema } from "@graphql-tools/schema";
import "graphql-import-node";
import { GraphQLSchema } from "graphql";
import { allResolvers } from "../resolvers";
import root from "./schema.graphql";
import student from "./student.graphql";
import coach from "./coach.graphql";
import tournament from "./tournament.graphql";
import team from "./team.graphql";

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [root, student, coach, tournament, team],
  resolvers: allResolvers,
});

export default schema;
