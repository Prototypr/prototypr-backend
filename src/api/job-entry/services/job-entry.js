'use strict';

/**
 * job-entry service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::job-entry.job-entry');
