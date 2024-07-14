const Redis = require("ioredis");

import { RedisPubSub } from "graphql-redis-subscriptions";

export const redisConnection = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,

  maxRetriesPerRequest: null,
});
export const pubsub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST), // Dedicated publisher client
  subscriber: new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST),
});
