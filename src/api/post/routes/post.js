'use strict';

/**
 * post router.
 */
//old bits:
// const { createCoreRouter } = require('@strapi/strapi').factories;
// module.exports = createCoreRouter('api::post.post');

//new bits:
/**
 * don't use the createCoreRouter
 * https://github.com/strapi/community-content/blob/e946efa817d3511ae62b82c427e8b6ac5bbed316/tutorials/code/jekyll-strapi-tutorial/api/api/post/config/routes.json
 * 
 * createCoreController gives these:
 * Core routers (i.e. find, findOne, create, update, and delete) correspond to default routes automatically created by Strapi when a new content-type is created.
 * https://github.com/strapi/documentation/blob/599add0eb7110721a0438a98bd6507a453343e4c/docs/developer-docs/latest/development/backend-customization/routes.md
 */

/**
 * make the routes ourselves, so we can add the correct policy for each:
 * policy is inside /post/policies/[policy-name]
 * 
 * you can put global policies inside 
 * /src/policies, and use them across any route too
 * ..for this, we just use the policy in the api/post/policies folder
 */

// find, findOne, create, update, and delete
const { createCoreRouter } = require('@strapi/strapi').factories;


//actually you can just extend it!
module.exports = createCoreRouter('api::post.post', {

  config: {
    find: {
      policies: ['api::post.can-read'],
      middlewares: [],
    },
    findOne: {
        policies: ['api::post.can-read'],
        middlewares: [],
    },
    create: {
      "policies": ['api::post.can-save']
    },
    update: {
        "policies": ['api::post.is-owner','api::post.can-save']
    },
    delete: {
        "policies": ['api::post.is-owner']
    },
  },
});




//  module.exports = 
//  {
//     "routes": [
//       {
//         "method": "GET",
//         "path": "/posts",
//         "handler": "post.find",
//         "config": {
//           "policies": [] // todo ? stop drafts being accessible?
//         }
//       },
//       {
//         "method": "GET",
//         "path": "/post/:_id",
//         "handler": "post.findOne",
//         "config": {
//           "policies": []
//         }
//       },
//       {
//         "method": "POST",
//         "path": "/posts",
//         "handler": "post.create",
//         "config": {
//             "policies": []//todo: user has to be logged in? think it is by default
//         }
//       },
//       {
//         "method": "PUT",
//         "path": "/posts/:_id",
//         "handler": "post.update",
//         "config": {
//             "policies": ['api::post.is-owner'] //user has to be owner to update
//         }
//       },
//       {
//         "method": "DELETE",
//         "path": "/posts/:_id",
//         "handler": "post.delete",
//         "config": {
//             "policies": ['api::post.is-owner'] //user has to be owner to delete
//         }
//       }
//     ]
//   }