const { v4: uuidv4 } = require('uuid');

module.exports = {
  async generateInviteToken(userId) {
    const token = uuidv4();
    const inviteToken = await strapi.entityService.create('plugin::invite-only.invite-token', {
      data: {
        token,
        owner: userId,
        used: false,
      },
    });
    return inviteToken;
  },
};