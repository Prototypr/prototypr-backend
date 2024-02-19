module.exports = {
    async generate(ctx) {
      const { userId } = ctx.request.body;
      const inviteToken = await strapi.plugin('invite-only').service('invite-token').generateInviteToken(userId);
      ctx.body = { inviteToken };
    },
  };