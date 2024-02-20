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
  async getUsersWithInvites({ pageSize, currentPage, searchTerm }) {
    console.log('searchterm')
    console.log(searchTerm)
    //used in the admin route only
    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      fields: ['id', 'username', 'email', 'firstName', 'secondName', 'slug'], // Include new fields in the selection
      populate: {
        invite_codes: {
          fields: ['code', 'used'],
        },
        invite_code: {
          fields: ['code', 'used'],
        }
      },
      filters: {
        $or: [
          { username: { $containsi: searchTerm } },
          { email: { $containsi: searchTerm } },
          { firstName: { $containsi: searchTerm } }, // Added firstName to the search filter
          { secondName: { $containsi: searchTerm } }, // Added secondName to the search filter
          { slug: { $containsi: searchTerm } }, // Added slug to the search filter
        ],
      },
      start: currentPage?currentPage:0,
      limit: pageSize?pageSize:10,
    });
    return users.length > 0 ? users : null;
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