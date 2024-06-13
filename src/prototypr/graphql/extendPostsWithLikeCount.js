// path: src/extensions/graphql/config/schema.graphql.js

module.exports = (strapi) => ({
  typeDefs: `
      extend type Post {
        likeCount: LikeCount
      }

        type LikeCount {
            total: Int
            fire: Int
            unicorn: Int
            like: Int
        }
    `,

  resolvers: {
    Post: {
      async likeCount(post, args, ctx) {
        const entries = await strapi.entityService.findMany("api::like.like", {
          // populate: { user: ['id'] },
          fields: ["total", "fire", "unicorn", "like"],
          filters: { post: { id: parseInt(post.id) } },
        });

        let totalCount = 0;
        let fires = 0;
        let unicorns = 0;
        let likes = 0;

        //for each entry add the total to the total count
        for (let i = 0; i < entries.length; i++) {
          totalCount += entries[i].total;
          fires += entries[i].fire ? 1 : 0;
          unicorns += entries[i].unicorn ? 1 : 0;
          likes += entries[i].like ? 1 : 0;
        }

        return {
          total: totalCount,
          fire: fires,
          unicorn: unicorns,
          like: likes,
        };
      },
    },
  },
});
