"use strict";

/**
 * notification service
 */

const { createCoreService } = require("@strapi/strapi").factories;

// https://docs.strapi.io/dev-docs/backend-customization/services
// extend core service with custom service
module.exports = createCoreService(
  "api::notification.notification",
  ({ strapi }) => ({
    // Method 1: Creating an entirely new custom service
    async clear(...args) {
        console.log(args)
      let response = { okay: true };

      if (response.okay === false) {
        return { response, error: true };
      }

      return response;
    },
  })
);
