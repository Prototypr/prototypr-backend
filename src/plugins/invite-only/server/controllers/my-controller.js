'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('invite-only')
      .service('myService')
      .getWelcomeMessage();
  },
});
