module.exports = {
  routes: [
    {
      method: "POST",
      path: "/analytics",
      handler: "analytics.checkNotification",
      config: {
        policies: ['api::analytics.can-read'],
        middlewares: [],
      },
    },
  ],
};