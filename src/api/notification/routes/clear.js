module.exports = {
    routes: [
      {
        method: "POST",
        path: '/notificationsClear',
        handler: 'notification.clear',
        config: {
          policies: ['api::analytics.can-read'],
          middlewares: [],
        },
        config: {
          // auth:false,
          // policies: ['api::analytics.can-read'],
          middlewares: [],
        },
      },
    ],
  };