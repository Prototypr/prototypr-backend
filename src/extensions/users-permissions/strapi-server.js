const { resendConfirmationEmail } = require("./resendConfirmationEmail");
const { updateMe, deleteAvatar, uploadAvatar } = require("./updateMe");
const { uploadImageToArticle } = require("./uploadBlogImage");
// https://medium.com/@fabian.froeschl/add-updateme-route-to-strapi-4-0s-users-permissons-plugin-fc31798df295
module.exports = (plugin) => {
  // https://javascript.plainenglish.io/add-a-customize-users-permissions-provider-for-strapi-v4-6aa78c642977
  plugin.services["providers"] = require("./server/services/providers");

  plugin.controllers.user.updateMe = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return updateMe(ctx);
  };
  plugin.controllers.user.deleteAvatar = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return deleteAvatar(ctx);
  };
  plugin.controllers.user.uploadAvatar = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return uploadAvatar(ctx);
  };
  plugin.controllers.user.uploadImageToArticle = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return uploadImageToArticle(ctx);
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/me",
    handler: "user.updateMe",
  });
  //delete avatar
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/avatar/delete",
    handler: "user.deleteAvatar",
  });
  //upload avatar
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/avatar/upload",
    handler: "user.uploadAvatar",
  });
  //update img to post
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/article/image/upload",
    handler: "user.uploadImageToArticle",
  });

  plugin.controllers.user.resendConfirmationEmail = (ctx) => {
    // console.log(ctx)
    // ctx.params.id = ctx.state.user.id;
    return resendConfirmationEmail(ctx);
  };
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/resendConfirmationEmail",
    handler: "user.resendConfirmationEmail",
  });

  /**
   * add avatar to /me endpoint
   * https://www.reddit.com/r/Strapi/comments/r7r0ie/images_not_displaying_in_api_response/i0rub7c/?utm_source=share&utm_medium=web2x&context=3
   *
   * @param {*} user
   * @returns
   */
  const sanitizeOutput = (user, currentUser) => {
    //remove email if it's not the current user being read
    if (currentUser.id !== user.id) {
      const {
        password,
        resetPasswordToken,
        confirmationToken,
        // email,
        ...sanitizedUser
      } = user; // be careful, you need to omit other private attributes yourself
      return sanitizedUser;
    } else {
      //if current user, don't need to remove the password from result
      const {
        password,
        resetPasswordToken,
        confirmationToken,
        ...sanitizedUser
      } = user; // be careful, you need to omit other private attributes yourself
      return sanitizedUser;
    }
  };

  plugin.controllers.user.me = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      ctx.state.user.id,
      { populate: ["avatar"] }
    );

    ctx.body = sanitizeOutput(user, ctx.state.user);
  };

  // plugin.controllers.user.find = async (ctx) => {
  //   const users = await strapi.entityService.findMany(
  //     'plugin::users-permissions.user',
  //     { ...ctx.params, populate: ['avatar'] }
  //   );

  //   ctx.body = users.map(user => sanitizeOutput(user));
  // };

  return plugin;
};
