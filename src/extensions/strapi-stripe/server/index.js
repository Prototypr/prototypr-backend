'use strict';

const register = require('./register');
const bootstrap = require('strapi-stripe/server/bootstrap');
const destroy = require('strapi-stripe/server/destroy');
const config = require('strapi-stripe/server/config');
// const contentTypes = require('strapi-stripe/server/content-types');
const contentTypes = require('../content-types');
// const controllers = require('strapi-stripe/server/controllers');
const controllers = require('./controllers');
const routes = require('strapi-stripe/server/routes');
const middlewares = require('strapi-stripe/server/middlewares');
const policies = require('strapi-stripe/server/policies');
const services = require('strapi-stripe/server/services');

module.exports = {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares,
};
