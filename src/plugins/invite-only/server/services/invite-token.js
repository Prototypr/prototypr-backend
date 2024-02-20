const { v4: uuidv4 } = require('uuid');

module.exports = {
  async generateInviteToken(userId, quantity) {
    
    for(var x = 0 ; x<quantity;x++){
      const token = uuidv4();
      await strapi.entityService.create('plugin::invite-only.invite-code', {
        data: {
          code:token,
          owner: userId,
          used: false,
        },
      });
    }
    return true;
  },
  // Function to check if an invite token is valid
  async checkInviteToken(code) {
    const inviteToken = await strapi.entityService.findMany('plugin::invite-only.invite-code', {
      filters: { code, used: false },
    });
    return inviteToken.length > 0 ? inviteToken[0] : null;
  },

  // Function to mark an invite token as used
  async useInviteToken(code, userId) {
    const updatedToken = await strapi.entityService.update('plugin::invite-only.invite-code', code.id, {
      data: {
        used: true,
        invitee: userId,
      },
    });
    return updatedToken;
  },
};