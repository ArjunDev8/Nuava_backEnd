export const analyticsConfig = {
  analytics: {
    username: process.env.ANALYTICS_DB_USERNAME || "root",
    password: process.env.ANALYTICS_DB_PASSWORD || "",
    database: process.env.ANALYTICS_DB_DBNAME || "typescript_test",
    host: process.env.ANALYTICS_DB_HOST || "localhost",
    port: process.env.ANALYTICS_DB_PORT || 5432,
    listenPort: process.env.LISTEN_PORT || 3000,
    dialect: "postgres",
  },
};
