import { IResolvers } from "@graphql-tools/utils";
import { ApolloError } from "apollo-server-express";
import { verifyJWTToken } from "../services/student";
import { createTeam, getAllTeams, getTeamWithPlayers } from "../services/team";
import { findCoachByID, UserEnum } from "../services/coach";
import { COACH_ROLE } from "../constants";

const TournamentResolvers: IResolvers = {
  Query: {
    getAllTeams: async (_, { filters }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== COACH_ROLE) {
          throw new Error("Unauthorized to get all teams");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        // Assuming getAllTeams is a service function that returns all teams
        const teams = await getAllTeams({
          filter: {
            typeOfSport: filters?.typeOfSport,
          },
          coachID: id,
          schoolID: coach.schoolID,
        });

        return teams;
      } catch (err: any) {
        throw new ApolloError(err.message);
      }
    },
    getTeamWithPlayers: async (_, { input }, { auth }) => {
      try {
        verifyJWTToken(auth, process.env.JWT_SECRET_KEY as string);

        const { teamId } = input;

        // Assuming getTeamsWithPlayers is a service function that returns teams with players
        const teams = await getTeamWithPlayers(teamId);

        return teams;
      } catch (err: any) {
        throw new ApolloError(err.message);
      }
    },
  },

  Mutation: {
    // Create Tournament
    createTeam: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== COACH_ROLE) {
          throw new Error("Unauthorized to create a team");
        }

        await createTeam(input, id);

        return {
          status: true,
          message: "Team created successfully",
        };
      } catch (err: any) {
        throw new ApolloError(err.message);
      }
    },
  },
};

export default TournamentResolvers;
