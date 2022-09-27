module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', process.env.ADMIN_JWT_SECRET),
  },
});
