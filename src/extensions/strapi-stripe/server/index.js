'use strict';

const register = require('./register');
const bootstrap = require('../../../plugins/strapi-stripe/server/bootstrap');
const destroy = require('../../../plugins/strapi-stripe/server/destroy');
const config = require('../../../plugins/strapi-stripe/server/config');
// const contentTypes = require('strapi-stripe/server/content-types');
const contentTypes = require('../content-types');
// const controllers = require('strapi-stripe/server/controllers');
const controllers = require('./controllers');
// const routes = require('strapi-stripe/server/routes');
const routes = require('./routes');
const middlewares = require('../../../plugins/strapi-stripe/server/middlewares');
const policies = require('../../../plugins/strapi-stripe/server/policies');
// const services = require('strapi-stripe/server/services');
const services = require('./services');

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
