import { makeExecutableSchema } from "@graphql-tools/schema";
import "graphql-import-node";
import { GraphQLSchema } from "graphql";
import root from "./schema.graphql";
import student from "./student.graphql";
import coach from "./coach.graphql";
import { allResolvers } from "../resolvers";

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [root, student, coach],
  resolvers: allResolvers,
});

export default schema;
