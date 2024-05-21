module.exports = {
    async generate(ctx) {
      const { userId, quantity, inviteeEmail, sendEmail, via} = ctx.request.body;
      const inviteToken = await strapi.plugin('invite-only').service('invite-token').generateInviteToken(userId, quantity, inviteeEmail, sendEmail, via);
      ctx.body = { inviteToken };
    },
    async getUsersWithInvites(ctx) {

      const { pageSize, currentPage, searchTerm } = ctx.request.query;
     
      const users = await strapi.plugin('invite-only').service('invite-token').getUsersWithInvites({ pageSize, currentPage, searchTerm });
      ctx.body = { users };
    },
      // Action to check invite token validity
    async checkToken(ctx) {
      const { token } = ctx.request.body;
      if (!token) {
        return ctx.badRequest('Token is required');
      }

      //check if token is the secret code
      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: "plugin",
        name: "invite-only",
      });

     const pass= await pluginStore.get({ key: "secretPasscodeConfig" })
      if(token === pass?.secretPasscode){
        return ctx.send({ valid: true });
      }

      const inviteToken = await strapi.plugin('invite-only').service('invite-token').checkInviteToken(token);
      if (!inviteToken) {
        return ctx.notFound('Invalid or used token');
      }

      ctx.send({ valid: true });
    },

    // Action to mark an invite token as used upon user registration
    async useToken(ctx) {
      const { token, userId } = ctx.request.body;
      if (!token || !userId) {
        return ctx.badRequest('Token and userId are required');
      }

      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: "plugin",
        name: "invite-only",
      });
      const pass= await pluginStore.get({ key: "secretPasscodeConfig" })

      const inviteToken = await strapi.plugin('invite-only').service('invite-token').checkInviteToken(token);
      if (!inviteToken || token === pass?.secretPasscode) {
        return ctx.notFound('Invalid or used token');
      }

      await strapi.plugin('invite-only').service('invite-token').useInviteToken(inviteToken, userId);
      ctx.send({ message: 'Token marked as used', token: inviteToken });
    },

    async getConfig(ctx) {
      const config = await strapi
        .plugin("invite-only")
        .service("invite-token")
        .getConfig();
      ctx.send(config);
    },
  
    async updateConfig(ctx) {
      const config = await strapi
        .plugin("invite-only")
        .service("invite-token")
        .updateConfig(ctx);
      ctx.send(config);
    },
  };