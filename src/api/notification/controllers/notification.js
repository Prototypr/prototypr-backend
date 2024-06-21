"use strict";

/**
 * notification controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::notification.notification",
  ({ strapi }) => ({
    async clear(ctx) {
      let body = ctx.request.body;

      let id = body.id;
      const userId = ctx.state.user.id;

      if (id == "*") {
        let query = `
          UPDATE "notifications"
          SET "read" = true
          WHERE "id" IN (
            SELECT "notification_id"
            FROM "notifications_notifiers_links"
            WHERE "user_id" = ${userId}
          )
        `;
        await strapi.db.connection.raw(query);
        ctx.send({ message: "All Notifications cleared" }, 200);
      } else if (id) {
        //id = e.g. 30

        let query = `
          UPDATE "notifications"
          SET "read" = true
          WHERE "id" = ${id}
            AND "id" IN (
              SELECT "notification_id"
              FROM "notifications_notifiers_links"
              WHERE "user_id" = ${userId}
            )
        `;
      await strapi.db.connection.raw(query);

        ctx.send({ message: `Notification ${id} cleared` }, 200);
      } else {
        ctx.send({ message: "No Notifications cleared" }, 401);
      }
    },
  })
);
