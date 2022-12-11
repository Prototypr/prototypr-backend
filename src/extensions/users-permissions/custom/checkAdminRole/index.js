/**
 * Update a/an user record.
 * https://strapi.io/video-library/update-own-user-data
 *
 * @return {Object}
 */
const fs = require("fs");

const _ = require("lodash");
const utils = require("@strapi/utils");

module.exports = {
  /**
   * @param {*} ctx
   */

  async checkAdminRole(ctx) {
    const { id } = ctx.params;

    try {
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        ctx.state.user.id,
        { populate: ["role"] }
      );

      const isAdmin = user.role.type === "admin";
      // also give permission to owner of the post

      ctx.send({
        status: 200,
        isAdmin,
      });
    } catch {
      ctx.send({
        status: 404,
      });
    }
  },
};
