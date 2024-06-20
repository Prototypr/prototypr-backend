const { v4: uuidv4 } = require('uuid');
const { checkTokenByEmail } = require('../controllers/invite-token-controller');

module.exports = {
  async generateInviteToken(userId, quantity, inviteeEmail=null, sendEmail=false, via) {
    
    if(inviteeEmail){
      let token = uuidv4();
      //each email has only 1 invite
      //check if invitee email already exists with an invite:
      const entry = await strapi.db.query('plugin::invite-only.invite-code').findOne({
        // select: ['title', 'description'],
        where: { inviteeEmail:inviteeEmail},
        // populate: { category: true },
      });   

      console.log(entry)
      //if found invite
      if(entry?.code){
        //use existing code for token
        token =  entry?.code;
      }else{
        //create new code with uuidv4 token
        await strapi.entityService.create('plugin::invite-only.invite-code', {
          data: {
            code:token,
            owner: userId,
            used: false,
            inviteeEmail:inviteeEmail,
            via
          },
        });
      }
      if(sendEmail){
        //send email here
        await strapi.plugins['email'].services.email.send({
          to: inviteeEmail,
          from: 'hello@prototypr.io', //e.g. single sender verification in SendGrid
          // cc: 'valid email address',
          // bcc: 'valid email address',
          replyTo: 'hello@prototypr.io',
          subject: 'Your Prototypr Invite',
          text: 'Thanks for supporting prototypr. Manage your ads by creating an account with this link:',
          html: `<p>Thanks for supporting prototypr. Manage your ads by creating an account with this link:</p>
          <p><a href="https://prototypr.io/onboard?signin=true&inviteeemail=${encodeURIComponent(inviteeEmail)}&invite_code=${encodeURIComponent(token)}">Join with invite</a> </p>
          <p>or paste this into your browser: https://prototypr.io/onboard?signin=true&inviteeemail=${encodeURIComponent(inviteeEmail)}&invite_code=${encodeURIComponent(token)} </p>
          `,
        })
      }
      return token;
      
    }else{
      for(var x = 0 ; x<quantity;x++){
        const token = uuidv4();

        await strapi.entityService.create('plugin::invite-only.invite-code', {
          data: {
            code:token,
            owner: userId,
            used: false,
            via
          },
        });
      }
      return true;
    }
  },
  async getUsersWithInvites({ pageSize, currentPage, searchTerm }) {
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
  async checkTokenByEmail(email) {
    const inviteToken = await strapi.entityService.findMany('plugin::invite-only.invite-code', {
      filters: { inviteeEmail: email, used: false },
    });
    return inviteToken.length > 0 ? inviteToken[0] : null;
  },

  // Function to mark an invite token as used
  async useInviteToken(code, userId) {

    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: "plugin",
      name: "invite-only",
    });
    const pass= await pluginStore.get({ key: "secretPasscodeConfig" })

    console.log('useInviteToken', code, userId, pass?.secretPasscode)
    if(code.code === pass?.secretPasscode){
      return pass.secretPasscode
    }

    const updatedToken = await strapi.entityService.update('plugin::invite-only.invite-code', code.id, {
      data: {
        used: true,
        invitee: userId,
      },
    });
    return updatedToken;
  },
  async getConfig() {
    try {
      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: "plugin",
        name: "invite-only",
      });

     const pass= await pluginStore.get({ key: "secretPasscodeConfig" })

     return pluginStore.get({ key: "secretPasscodeConfig" });
    } catch (error) {
      strapi.log.error(error.message);
      return {
        error:
          "An error occurred while fetching secret pascode config. Please try after some time",
      };
    }
  },

  updateConfig(ctx) {
    try {
      const reqBody = ctx.request.body;
      const data = {
        secretPasscode: reqBody.secretPasscode,
      };
      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: "plugin",
        name: "invite-only",
      });

      return pluginStore.set({
        key: "secretPasscodeConfig",
        value: data,
      });
    } catch (error) {
      strapi.log.error(error.message);
      return {
        error:
          "An error occurred while updting the OpenAI config. Please try after some time",
      };
    }
  },


};