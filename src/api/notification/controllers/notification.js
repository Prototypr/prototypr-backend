"use strict";

/**
 * notification controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::notification.notification",
  ({ strapi }) => ({
    async clear(ctx) {
      console.log("hi clear");

      let body = ctx.request.body;

      let ids = body.id;
      const userId = ctx.state.user.id;

      console.log(ids);
      if (ids == "*") {
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



        // console.log(addressItems);
        // await strapi.query("api::notification.notification").updateMany({
        //   where: {
        //     notifiers: {id: userId} ,

        //     // notifiers: {
        //     //   id: userId
        //     // },
        //   },
        //   data: {
        //     read: true,
        //   },
        // });

        ctx.send({ message: "All Notifications cleared" }, 200);
      } else if (ids?.length > 0) {
        console.log("idsss");
        await strapi.db.query("api::notification.notification").updateMany({
          where: {
            notifiers: userId,
            id_in: ids,
          },
          data: {
            read: true,
          },
        });

        ctx.send({ message: "Notifications cleared" }, 200);
      } else {
        ctx.send({ message: "No Notifications cleared" }, 401);
      }
    },
  })
);
