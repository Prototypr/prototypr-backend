'use strict';
/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

const {sanitize} = require('@strapi/utils');

/* eslint-disable no-useless-escape */
const _ = require('lodash');
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  async login(ctx) {

    const sentryService = strapi.plugin('sentry').service('sentry');


    const {loginToken} = ctx.query;
    const {passwordless} = strapi.plugins['passwordless'].services;
    const {user: userService, jwt: jwtService} = strapi.plugins['users-permissions'].services;
    const isEnabled = await passwordless.isEnabled();

    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    if (_.isEmpty(loginToken)) {
      return ctx.badRequest('token.invalid');
    }
    const token = await passwordless.fetchToken(loginToken);

    if (!token || !token.is_active) {
      sentryService.sendError({desc:'token is valid?',token}, (scope, sentryInstance) => {
        scope.setTag('debug_log', '11');
      });
      return ctx.badRequest('token.invalid');
    }

    const isValid = await passwordless.isTokenValid(token);

    sentryService.sendError({desc:'token is valid?',obj:isValid}, (scope, sentryInstance) => {
      scope.setTag('debug_log', '5');
    });

    if (!isValid) {
      await passwordless.deactivateToken(token);
      return ctx.badRequest('token.invalid');
    }

    await passwordless.updateTokenOnLogin(token);

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: {email: token.email}
    });


    sentryService.sendError({desc:'found token user?',obj:isValid}, (scope, sentryInstance) => {
      scope.setTag('debug_log', '6');
    });

    if (!user) {
      sentryService.sendError({desc:'wrong.email'}, (scope, sentryInstance) => {
        scope.setTag('debug_log', '7');
      });
      return ctx.badRequest('wrong.email');
    }

    if (user.blocked) {
      sentryService.sendError({desc:'blocked.user'}, (scope, sentryInstance) => {
        scope.setTag('debug_log', '8');
      });
      return ctx.badRequest('blocked.user');
    }

    if (!user.confirmed) {
      await userService.edit(user.id, {confirmed: true});
    }
    const userSchema = strapi.getModel('plugin::users-permissions.user');
    // Sanitize the template's user information
    const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);

    let context;
    try {
      context = JSON.parse(token.context);
    } catch (e) {
      context = {}
    }
    sentryService.sendError({desc:'context made', context, user, sanitizedUserInfo}, (scope, sentryInstance) => {
      scope.setTag('debug_log', '9');
    });
    ctx.send({
      jwt: jwtService.issue({id: user.id}),
      user: sanitizedUserInfo,
      context
    });
  },

  async sendLink(ctx) {
    const sentryService = strapi.plugin('sentry').service('sentry');

    const {passwordless} = strapi.plugins['passwordless'].services;

    const isEnabled = await passwordless.isEnabled();

    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    const params = _.assign(ctx.request.body);

    const email = params.email ? params.email.trim().toLowerCase() : null;
    const context = params.context || {};
    const username = params.username || null;

    const isEmail = emailRegExp.test(email);

    if (email && !isEmail) {
      return ctx.badRequest('wrong.email');
    }

    let user;
    try {
      user = await passwordless.user(email, username);
      sentryService.sendError({desc:'passwordless user', user}, (scope, sentryInstance) => {
        scope.setTag('debug_log', '10');
      });
    } catch (e) {
      return ctx.badRequest('wrong.user')
    }

    if (!user) {
      return ctx.badRequest('wrong.email');
    }

    if (email && user.email !== email) {
      return ctx.badRequest('wrong.user')
    }

    if (user.blocked) {
      return ctx.badRequest('blocked.user');
    }

    try {
      const token = await passwordless.createToken(user.email, context);
      await passwordless.sendLoginLink(token);
      ctx.send({
        email,
        username,
        sent: true,
      });
    } catch (err) {
      return ctx.badRequest(err);
    }
  },
};