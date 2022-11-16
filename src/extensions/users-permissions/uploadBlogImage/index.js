/**
 * Update a/an user record.
 * https://strapi.io/video-library/update-own-user-data
 *
 * @return {Object}
 */
const fs = require("fs");

const _ = require("lodash");
const utils = require("@strapi/utils");
// const { getService } = require("./libs/getService");
// const { validateUpdateUserBody } = require("./libs/userValidation");

const { sanitize } = utils;
// const { ApplicationError, ValidationError } = utils.errors;

// const sanitizeOutput = (user, ctx) => {
//   const schema = strapi.getModel("plugin::users-permissions.user");
//   const { auth } = ctx.state;

//   return sanitize.contentAPI.output(user, schema, { auth });
// };

module.exports = {
  /**
   * delete avatar
   * @param {*} ctx
   */

  async uploadImageToArticle(ctx) {
    const { id } = ctx.params;
    const file = ctx?.request?.files?.files;
    if (file) {
      try {
        const response = await strapi.plugins["upload"].services.upload.upload({
          data: {
            ref: "plugin::users-permissions.user",
            source: "users-permissions",
            refId: id,
          },
          files: file,
        });
        console.log(response[0]?.url)
        ctx.send({
          uploaded: "true",
          message: "Profile picture uploaded",
          url: response[0]?.url,
        });
      } catch (e) {
        ctx.send({ uploaded: "false", message: e.message });
      }
    } else {
      ctx.send({ uploaded: "false", message: "No file to be uploaded found" });
    }
  },
};
