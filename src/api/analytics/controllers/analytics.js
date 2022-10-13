'use strict';

/**
 * A set of functions called "actions" for `analytics`
 */

 module.exports = {
  async checkNotification(ctx, next) {
    try {

      const url = ctx.request?.body?.url

      const data = await strapi
        .service("api::analytics.analytics")
        .checkNotification(url);

      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  },
};