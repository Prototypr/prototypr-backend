module.exports = ({ env }) => {
  if (env("NODE_ENV") === "development") {
    // in development ssl is false
    return {
      connection: {
        client: "postgres",
        connection: {
          host: env("DATABASE_HOST", process.env.DATABASE_HOST),
          port: env.int("DATABASE_PORT", process.env.DATABASE_PORT),
          database: env("DATABASE_NAME", process.env.DATABASE_NAME),
          user: env("DATABASE_USERNAME", process.env.DATABASE_USERNAME),
          password: env("DATABASE_PASSWORD", process.env.DATABASE_PASSWORD),
          // ssl: {
          //   rejectUnauthorized: false,
          //   // sslmode: 'require'
          // },
          pool: {
            min: 0,
            max: 5,
            idleTimeoutMillis: 60000,
            acquireTimeoutMillis: 60000,
          }
        },
      },
    };
  } else if (env("NODE_ENV") === "production" || env("NODE_ENV") === "test") {
    // when in production
    return {
      connection: {
        client: "postgres",
        connection: {
          host: env("DATABASE_HOST", process.env.DATABASE_HOST),
          port: env.int("DATABASE_PORT", process.env.DATABASE_PORT),
          database: env("DATABASE_NAME", process.env.DATABASE_NAME),
          user: env("DATABASE_USERNAME", process.env.DATABASE_USERNAME),
          password: env("DATABASE_PASSWORD", process.env.DATABASE_PASSWORD),
          // ssl: {
          //   rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false), // For self-signed certificates
          // },
          pool: {
            min: 0,
            max: 10,
            idleTimeoutMillis: 40000,
            createTimeoutMillis: 40000,
            acquireTimeoutMillis: 40000,
          },
        },
        debug: true,
      },
    };
  }
};
