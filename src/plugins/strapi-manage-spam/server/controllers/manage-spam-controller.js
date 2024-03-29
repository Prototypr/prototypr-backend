module.exports = {
    async getUnpublishedPosts(ctx) {

      const { pageSize, currentPage } = ctx.request.query;
     
      const users = await strapi.plugin('strapi-manage-spam').service('manageSpam').getUnpublishedPosts({ pageSize, currentPage });
      ctx.body = { users };
    },
    async getPotentialSpammers(ctx) {

      const { pageSize, currentPage, options } = ctx.request.query;
     
      const users = await strapi.plugin('strapi-manage-spam').service('manageSpam').getPotentialSpammers({ pageSize, currentPage, options });
      ctx.body = { users };
    },
    async deletePotentialSpammers(ctx) {

      const { ids } = ctx.request.query;
     
      const users = await strapi.plugin('strapi-manage-spam').service('manageSpam').deletePotentialSpammers({ ids });
      ctx.body = { users };
    },
    async approveUsers(ctx) {

      const { ids } = ctx.request.query;
     
      const users = await strapi.plugin('strapi-manage-spam').service('manageSpam').approveUsers({ ids });
      ctx.body = { users };
    },
  };