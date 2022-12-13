module.exports = (strapi) => {
  return () => ({
    typeDefs: `
        type Query {
            randomPost: [Post]
        }
        `,
    resolvers: {
      Query: {
        async randomPost() {
          //if there is tags, find posts with the same tags
          let randomPosts = [];
          randomPosts = await strapi.entityService.findMany("api::post.post", {
            fields: ["id", "slug", "title", "date"],
            populate: ["legacyFeaturedImage", "featuredImage"],

            filters: {
              type: { $eq: "article" },
              status: { $eq: "publish" },
            },
          });

          // fetch the top posts
          const topPosts = await strapi.entityService.findMany(
            "api::post.post",
            {
              fields: ["id", "slug", "title"],
              limit: 7,
              sort: ["esES:desc", "featured:desc", "tier:asc", "date:desc"],
              filters: {
                type: { $eq: "article" },
                status: { $eq: "publish" },
              },
            }
          );

          // get all the ids from the top posts so they can be removed from the random posts
          const topPostsIds = topPosts.map((x) => x.id);

          const removeTopPostsFromRandomEntries = randomPosts.filter((post) => {
            if (!topPostsIds.includes(post.id)) {
              return post;
            }
          });

          const randomEntries = [...removeTopPostsFromRandomEntries]
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);

          return randomEntries;
        },
      },
    },
    resolversConfig: {
      "Query.randomPost": {
        auth: false, //requires auth
      },
    },
  });
};
