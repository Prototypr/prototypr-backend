'use strict';

/**
 * passwordless.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require("lodash");
const crypto = require("crypto");
const {sanitize} = require('@strapi/utils');
const {nanoid} = require("nanoid");
const axios = require("axios");//prototypr

module.exports = (
  {
    strapi
  }
) => {

  return {

    async initialize() {
    },

    settings() {
      const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'passwordless',
      });
      return pluginStore.get({key: 'settings'});
    },

    userSettings() {
      const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
      });
      return pluginStore.get({key: 'advanced'});
    },

    async isEnabled() {
      const settings = await this.settings();
      return !!settings.enabled;
    },

    //added invite code
    async createUser(user, invite_code) {

      //check token is valid
      const checkEndpoint = `${process.env.STRAPI_URL}/api/invite-only/check-token` 
      const checkResponse = await axios.post(checkEndpoint, { token: invite_code }, {headers: {'Content-Type': 'application/json'}});
      //if token invalid
      if(!(checkResponse?.data?.valid==true && checkResponse?.data?.token?.used==false)){
        return false
      }


      const userSettings = await this.userSettings();
      const role = await strapi
        .query('plugin::users-permissions.role')
        .findOne({
          where: {type: userSettings.default_role}
        });

      const newUser = {
        email: user.email,
        username: user.username || user.email,
        role: {id: role.id},
        invite_code:checkResponse?.data?.token?.id//prototypr invite code
      };
      const res =  await strapi
        .query('plugin::users-permissions.user')
        .create({data: newUser, populate: ['role']});

       //finally update prototypr invite code to used
       const updatedToken = await strapi.entityService.update('plugin::invite-only.invite-code', checkResponse?.data?.token?.id, {
        data: {
          used: true,
        },
      });

      return res

    },

    //prototypr mod - add inviteCode
    async user(email, username, invite_code) {
      const settings = await this.settings();
      const {user: userService} = strapi.plugins['users-permissions'].services;
      const user = email ? await this.fetchUser({email}) : null;

      if (user) {
        return user;
      }
      const userByUsername = username ? await this.fetchUser({username}) : null;
      
      if (userByUsername) {
        return userByUsername
      }

      if (email && settings.createUserIfNotExists) {
        //prototypr mode - only create user if they have valid invite
        if(!invite_code){
          return false
        }
        return this.createUser({email, username},invite_code)
      }
      return false;
    },

    async sendLoginLink(token) {
      const settings = await this.settings();
      const user = await this.fetchUser({email: token.email})

      const text = await this.template(settings.message_text, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user
      });

      const html = await this.template(settings.message_html, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user
      });

      const subject = await this.template(settings.object, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user
      });

      const sendData = {
        to: token.email,
        from:
          settings.from_email && settings.from_name
            ? `${settings.from_name} <${settings.from_email}>`
            : undefined,
        replyTo: settings.response_email,
        subject,
        text,
        html,
      }
      // Send an email to the user.
      return await strapi
        .plugin('email')
        .service('email')
        .send(sendData);
    },

    async createToken(email, context) {
      const settings = await this.settings();
      const {token_length = 20} = settings;
      // seems like the query gets run after the new one is created, so sets it back to inactive
      // so add await to wait for it to comlete first
      await strapi.query('plugin::passwordless.token').update({where: {email}, data: {is_active: false}});
      const body = nanoid(token_length);
      const tokenInfo = {
        email,
        body,
        is_active:true,//maybe dont need to set this anymore, but just in case
        context: JSON.stringify(context)
      };
      return strapi.query('plugin::passwordless.token').create({data: tokenInfo});
    },

    updateTokenOnLogin(token) {
      const tokensService = strapi.query('plugin::passwordless.token');
      return tokensService.update({where: {id: token.id}, data: {is_active: false, login_date: new Date()}});
    },

    async isTokenValid(token) {
      const settings = await this.settings();
      const tokenDate = new Date(token.createdAt).getTime() / 1000;
      const nowDate = new Date().getTime() / 1000;
      return nowDate - tokenDate <= settings.expire_period;
    },

    async deactivateToken(token) {
      const tokensService = strapi.query('plugin::passwordless.token');
      await tokensService.update(
        {where: {id: token.id}, data: {is_active: false}}
      );
    },

    fetchToken(body) {
      const tokensService = strapi.query('plugin::passwordless.token');
      return tokensService.findOne({where: {body}});
    },

    async fetchUser(data) {
      const userSchema = strapi.getModel('plugin::users-permissions.user');
      const user = await strapi.query('plugin::users-permissions.user').findOne({where: data, populate: ['role']})
      if (!user) {
        return user;
      }
      let sanitizedUser = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);
      if(!sanitizedUser.email && user.email){
        sanitizedUser.email = user.email
      }
      return sanitizedUser
    },

    template(layout, data) {
      const compiledObject = _.template(layout);
      return compiledObject(data);
    }
  };
};
