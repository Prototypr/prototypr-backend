'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('strapi-manage-spam')
      .service('myService')
      .getWelcomeMessage();
  },
});
