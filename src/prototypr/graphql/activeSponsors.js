module.exports = (strapi) => ({
  typeDefs: `
    type Query {
      activeSponsors(pageSize: Int, offset: Int): ActiveSponsors
      count: Int
      total: Int
    }

    type ActiveSponsors {
      posts: [ActiveSponsor]
    }

    type ActiveSponsor {
        id: ID
        title: String
        description: String
        weeks: JSON
        publishedAt: DateTime
        featuredImage: String
        banner: String
        link: String
        active: Boolean
        #productId: String
        postType: String
        fallback: Boolean
    }
  `,
  resolvers: {
    Query: {
      activeSponsors: {
        resolve: async (parent, args, context) => {
          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db
            .query("api::sponsored-post.sponsored-post")
            .findWithCount({
              select: [
                "id",
                "publishedAt",
                "link",
                "weeks",
                "title",
                "description",
                "active",
                // "productId",
                "fallback"
              ],
              where: {
                $or: [
                  {
                    $and: [
                      { weeks: { $notNull: true } },
                      { paid: true },
                      // {type:args.type},
                      // {active:true}
                    ]
                  },
                  { fallback: true }
                ]
              },
              limit: args.pageSize,
              offset: args.offset,
              populate: {
                banner: {
                  populate: { url: true },
                },
                featuredImage: {
                  populate: { url: true },
                },
              },
            });

          // Assuming entries is your original array of posts
          let activePosts = entries
          .filter((post) => isPostActive(post.weeks.website, post.fallback)) // First, filter out non-active posts
          .map((post) => ({
            // Then, transform the filtered posts
            id: post.id,
            title: post.title,
            description: post.description,
            weeks: post.weeks,
            publishedAt: post.publishedAt,
            type: post.type,
            featuredImage: post.featuredImage?.url,
            banner: post.banner?.url,
            link: post.link,
            active: post.active,
            // productId: post.productId,
            postType:'ad',
            fallback: post.fallback
          }));
          
          // console.log(activePosts[0])
          return {
            posts:activePosts,
            count:activePosts?.length,
            // total
          };
        },
      },
    },
  },
  resolversConfig: {
    "Query.activeSponsors": {
      auth: false, //requires auth
    },
  },
});

function isPostActive(weeks, fallback) {
  // Get the current timestamp
  const now = Date.now();

  if(fallback){
    return true
  }

  if(weeks.length){
    // Check each week to see if 'now' falls within the start and end range
    for (const week of weeks) {
      if (now >= week.start && now <= week.end) {
        return true; // The post is active
      }
    }
  }

  // If none of the weeks match the condition, the post is not active
  return false;
}
