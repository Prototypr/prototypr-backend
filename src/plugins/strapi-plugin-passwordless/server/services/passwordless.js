"use strict";

/**
 * passwordless.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require("lodash");
// const crypto = require("crypto");
const { sanitize } = require("@strapi/utils");
const { nanoid } = require("nanoid");
const axios = require("axios"); //prototypr

module.exports = ({ strapi }) => {
  return {
    async initialize() {},

    settings() {
      const pluginStore = strapi.store({
        environment: "",
        type: "plugin",
        name: "passwordless",
      });
      return pluginStore.get({ key: "settings" });
    },

    userSettings() {
      const pluginStore = strapi.store({
        environment: "",
        type: "plugin",
        name: "users-permissions",
      });
      return pluginStore.get({ key: "advanced" });
    },

    async isEnabled() {
      const settings = await this.settings();
      return !!settings.enabled;
    },

    //added invite code
    async createUser(user, invite_code) {
      //check token is valid
      let inviteToken = false;
      if (invite_code) {
        //check secret code (bypassing invite token)
        const pluginStore = strapi.store({
          environment: strapi.config.environment,
          type: "plugin",
          name: "invite-only",
        });
        const pass = await pluginStore.get({ key: "secretPasscodeConfig" });

        console.log("useInviteToken", invite_code, user, pass?.secretPasscode);
        if (invite_code === pass?.secretPasscode) {
          inviteToken = pass.secretPasscode;
        } else {
          //check invite token
          inviteToken = await strapi
            .plugin("invite-only")
            .service("invite-token")
            .checkInviteToken(invite_code);
        }
      } else if (!invite_code && !inviteToken) {
        inviteToken = await strapi
          .plugin("invite-only")
          .service("invite-token")
          .checkTokenByEmail(user.email);

        if (
          inviteToken.inviteeEmail == user.email &&
          inviteToken?.used == false
        ) {
          //valid token
          inviteTokenValid = true;
        }
      }

      const userSettings = await this.userSettings();
      const role = await strapi
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: userSettings.default_role },
        });

      const newUser = {
        email: user.email,
        username: user.username || generateFriendlyUsername(user.email),
        role: { id: role.id },
        invite_code: inviteToken?.id?inviteToken?.id:null, //prototypr invite code
      };
      const res = await strapi
        .query("plugin::users-permissions.user")
        .create({ data: newUser, populate: ["role"] });

      //finally update prototypr invite code to used
      if(inviteToken?.id){
        await strapi.entityService.update(
          "plugin::invite-only.invite-code",
          inviteToken?.id,
          {
            data: {
              used: true,
            },
          }
        );
      }

      //more prototypr mod - create company and add all spnsored-posts to the company if invite was via payment
      if (inviteToken?.via == "payment") {
        await createCompanyForSponsors({
          email: user?.email,
          user: res,
          inviteeEmail: inviteToken?.inviteeEmail,
        });
      }

      return res;
    },

    //prototypr mod - add inviteCode
    async user(email, username, invite_code) {
      const settings = await this.settings();
      const { user: userService } =
        strapi.plugins["users-permissions"].services;
      const user = email ? await this.fetchUser({ email }) : null;

      if (user) {
        return user;
      }
      const userByUsername = username
        ? await this.fetchUser({ username })
        : null;

      if (userByUsername) {
        return userByUsername;
      }

      if (email && settings.createUserIfNotExists) {
        //prototypr mode - only create user if they have valid invite

        //get invite code by email

        // if(!invite_code){
        //   return false
        // }
        return this.createUser({ email, username }, invite_code);
      }
      return false;
    },

    async sendLoginLink(token) {
      const settings = await this.settings();
      const user = await this.fetchUser({ email: token.email });

      const text = await this.template(settings.message_text, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user,
      });

      const html = await this.template(settings.message_html, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user,
      });

      const subject = await this.template(settings.object, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user,
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
      };
      // Send an email to the user.
      return await strapi.plugin("email").service("email").send(sendData);
    },

    async createToken(email, context) {
      const settings = await this.settings();
      const { token_length = 20 } = settings;
      // seems like the query gets run after the new one is created, so sets it back to inactive
      // so add await to wait for it to comlete first
      await strapi
        .query("plugin::passwordless.token")
        .update({ where: { email }, data: { is_active: false } });
      const body = nanoid(token_length);
      const tokenInfo = {
        email,
        body,
        is_active: true, //maybe dont need to set this anymore, but just in case
        context: JSON.stringify(context),
      };
      return strapi
        .query("plugin::passwordless.token")
        .create({ data: tokenInfo });
    },

    updateTokenOnLogin(token) {
      const tokensService = strapi.query("plugin::passwordless.token");
      return tokensService.update({
        where: { id: token.id },
        data: { is_active: false, login_date: new Date() },
      });
    },

    async isTokenValid(token) {
      const settings = await this.settings();
      const tokenDate = new Date(token.createdAt).getTime() / 1000;
      const nowDate = new Date().getTime() / 1000;
      return nowDate - tokenDate <= settings.expire_period;
    },

    async deactivateToken(token) {
      const tokensService = strapi.query("plugin::passwordless.token");
      await tokensService.update({
        where: { id: token.id },
        data: { is_active: false },
      });
    },

    fetchToken(body) {
      const tokensService = strapi.query("plugin::passwordless.token");
      return tokensService.findOne({ where: { body } });
    },

    async fetchUser(data) {
      const userSchema = strapi.getModel("plugin::users-permissions.user");
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: data, populate: ["role"] });
      if (!user) {
        return user;
      }
      let sanitizedUser = await sanitize.sanitizers.defaultSanitizeOutput(
        userSchema,
        user
      );
      if (!sanitizedUser.email && user.email) {
        sanitizedUser.email = user.email;
      }
      return sanitizedUser;
    },

    template(layout, data) {
      const compiledObject = _.template(layout);
      return compiledObject(data);
    },
  };
};

const createCompanyForSponsors = async ({ user, email, inviteeEmail }) => {
  const companyName = `${user.username}'s company`;
  const companyWebsite = ``;
  const contactEmail = `${email}`;

  // console.log('createcompnay for sponsors')
  // console.log('user:', user)
  try {
    //get all sponsored posts with user's email and no company to this company
    let sponsoredPostIds = [];
    const sponsoredPosts = await strapi.entityService.findMany(
      "api::sponsored-post.sponsored-post",
      {
        populate: "*",
        filters: {
          $and: [
            {
              company: null,
            },
            {
              email: inviteeEmail,
            },
          ],
        },
      }
    );

    // console.log('sponsoredPosts', sponsoredPosts)
    for (var x = 0; x < sponsoredPosts.length; x++) {
      sponsoredPostIds.push(sponsoredPosts[x].id);
    }

    // console.log('sponsoredPostIds', sponsoredPostIds)

    // create a new companyProfile if it doesn't exist
    const companyProfile = await strapi.entityService.create(
      "api::company.company",
      {
        data: {
          name: companyName,
          url: companyWebsite,
          email: contactEmail,
          user: user?.id, //company owner
          members: [user.id], //add first member,
          sponsored_posts: sponsoredPostIds,
        },
      }
    );
  } catch (e) {
    console.log(e);
  }
};

function generateFriendlyUsername(email) {
  const animals = [
    "Bear",
    "Tiger",
    "Lion",
    "Eagle",
    "Wolf",
    "Fox",
    "Deer",
    "Owl",
    "Hawk",
    "Dolphin",
  ];
  const firstPart = email.split("@")[0]; // Get the part before '@'
  const firstLetter = firstPart.charAt(0).toUpperCase(); // Get the first letter and make it uppercase
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)]; // Pick a random animal
  const randomNumber = Math.floor(Math.random() * 100); // Generate a random number between 0 and 99

  return `${firstLetter}${randomNumber}${randomAnimal}`; // Combine them to form the username
}
