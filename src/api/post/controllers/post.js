// 'use strict';

// /**
//  *  post controller
//  */

const { createCoreController } = require("@strapi/strapi").factories;

// // module.exports = createCoreController('api::post.post');

// // populate tags by default
// // https://forum.strapi.io/t/discussion-regarding-default-population-of-rest/13395/23
module.exports = createCoreController("api::post.post", ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate: ["tag"] };

    // Calling the default core action
    const { data, meta } = await super.find(ctx);
    // console.log(data)
    // some more custom logic

    return { data, meta };
  },
  async update(ctx) {
    // https://stackoverflow.com/questions/70639573/strapi-4-populate-when-update
    ctx.query = {
      ...ctx.query,
      populate: {
        seo: true,
        featuredImage: {fields:["url"]},
        legacyFeaturedImage: {fields:["mediaItemUrl"]},
        legacyAttributes: { fields: ["imgUrl"] },
        tags: true,
      },
    };
    // const response = await super.findOne(ctx);
    const response = await super.update(ctx);
    return response;

  },
}));
