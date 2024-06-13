'use strict';

/**
 * like router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::like.like');

//actually you can just extend it!
//just reuse post policies, they work fine
module.exports = createCoreRouter('api::like.like', {

    config: {
    //   find: {
    //     policies: ['api::post.can-read'],
    //     middlewares: [],
    //   },
    //   findOne: {
    //       policies: ['api::post.can-read'],
    //       middlewares: [],
    //   },
      create: {
        "policies": ['api::like.can-create']
      },
      update: {
          "policies": ['api::like.is-owner','api::like.can-save']
      },
      delete: {
          "policies": ['api::like.is-owner']
      },
    },
  });
  
  