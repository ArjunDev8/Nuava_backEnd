import { IResolvers } from "@graphql-tools/utils";
import { ApolloError } from "apollo-server-express";
import { verifyJWTToken } from "../services/student";
import {
  createTeam,
  deleteTeam,
  editTeam,
  getAllAvailablePlayers,
  getAllTeams,
  getTeamWithPlayers,
} from "../services/team";
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

    getAllAvailablePlayers: async (_, { input }, { auth }) => {
      try {
        const { id } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }
        const { schoolID } = coach;
        const { typeOfSport } = input;

        console.log("THIS IS CALLED", schoolID, typeOfSport);

        // Assuming getAllAvailablePlayers is a service function that returns all available players
        const players = await getAllAvailablePlayers({
          schoolID,
          typeOfSport,
        });

        return players;
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
    deleteTeam: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== COACH_ROLE) {
          throw new Error("Unauthorized to delete a team");
        }

        // Assuming deleteTeam is a service function that deletes a team
        // and returns a boolean value
        const isDeleted = await deleteTeam(input.teamId, id);

        return {
          status: isDeleted,
          message: isDeleted ? "Team deleted successfully" : "Team not found",
        };
      } catch (err: any) {
        throw new ApolloError(err.message);
      }
    },
    editTeam: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== COACH_ROLE) {
          throw new Error("Unauthorized to edit a team");
        }

        // Assuming editTeam is a service function that edits a team
        const result = await editTeam(input.teamId, input, id);

        return {
          status: true,
          message: "Team edited successfully",
          data: result,
        };
      } catch (err: any) {
        throw new ApolloError(err.message);
      }
    },
  },
};

export default TournamentResolvers;
