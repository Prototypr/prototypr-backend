const { resendConfirmationEmail } = require("./custom/resendConfirmationEmail");
const { updateMe, deleteAvatar, uploadAvatar } = require("./custom/updateMe");
const { uploadImageToArticle } = require("./custom/uploadBlogImage");
const { createJobPost, updateJobPost } = require("./custom/createJobPost");
const { createCompany, updateCompany } = require("./custom/createCompany");
const {createSponsoredPost, updateSponsoredPost, updateBookingWeeks} = require('./custom/createSponsoredPost')
const { fetchPlausibleStatsForUser } = require("./custom/fetchPlausibleStats");

const { checkAdminRole } = require("./custom/checkAdminRole");
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

  plugin.controllers.user.createJobPost = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return createJobPost(ctx);
  };
  plugin.controllers.user.updateJobPost = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return updateJobPost(ctx);
  };
  plugin.controllers.user.createCompany = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return createCompany(ctx);
  };
  plugin.controllers.user.updateCompany = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return updateCompany(ctx);
  };
  plugin.controllers.user.createSponsoredPost = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return createSponsoredPost(ctx);
  };
  plugin.controllers.user.updateSponsoredPost = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return updateSponsoredPost(ctx);
  };
  plugin.controllers.user.updateBookingWeeks = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return updateBookingWeeks(ctx);
  };
  plugin.controllers.user.fetchPlausibleStatsForUser = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return fetchPlausibleStatsForUser(ctx);
  };

  plugin.controllers.user.checkAdminRole = (ctx) => {
    ctx.params.id = ctx.state.user.id;
    return checkAdminRole(ctx);
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

  // job post endpoint
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/createJobPost",
    handler: "user.createJobPost",
  });
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/updateJobPost",
    handler: "user.updateJobPost",
  });
  // company post endpoint
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/createCompany",
    handler: "user.createCompany",
  });
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/updateCompany",
    handler: "user.updateCompany",
  });
  // sponsored post endpoint
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/createSponsoredPost",
    handler: "user.createSponsoredPost",
  });
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/updateSponsoredPost",
    handler: "user.updateSponsoredPost",
  });
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/updateBookingWeeks",
    handler: "user.updateBookingWeeks",
  });
  //fetch post analytics for user
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/posts/stats",
    handler: "user.fetchPlausibleStatsForUser",
  });
  //update img to post
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/article/role",
    handler: "user.checkAdminRole",
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
      { populate: ["avatar", "role", "companies", "tags", "newsletters", "invite_codes", "invite_code"] }
    );
    
    if(user?.companies?.length){
      //get company logo
      const company = await strapi.entityService.findOne(
        "api::company.company",
        user?.companies[0].id,
        { populate: ["logo"] }
      );
      user.companies[0].logo = company.logo?.url
    }
    
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
