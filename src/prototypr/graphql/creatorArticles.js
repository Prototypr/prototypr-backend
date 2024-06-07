module.exports = (strapi) => ({
  typeDefs: `
    type Query {
      creatorPosts(status: [String]!, pageSize: Int, offset: Int, type:String): UserPosts
      count: Int
    }

    type CreatorPosts {

      posts: [CreatorPost]
      count: Int
    }

    type CreatorPost {

      id: ID
      title: String
      excerpt: String
      slug: String
      status: String
      date: String
      featuredImage: String
      tier: Int
      published_at: String
      type: String
      interviews: [JSON]
      tools: [JSON]
    }
  `,
  resolvers: {
    Query: {
      creatorPosts: {
        resolve: async (parent, args, context) => {
          const where = {
            status: args.status,
            creators: context.state.user?.id,
          };
          if (args.type) {
            where.type = args.type;
          }
          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db
            .query("api::post.post")
            .findWithCount({
              select: [
                "id",
                "slug",
                "title",
                "date",
                "status",
                "type",
                "excerpt",
              ],
              where: where,
              limit: args.pageSize,
              offset: args.offset,
              orderBy: { date: "DESC" },
              populate: {
                interviews: true,
                tools: true,
                featuredImage: true,
              },
            });
          let posts = entries.map((post) => {
            console.log(post);
            return {
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              status: post.status,
              date: post.date,
              featuredImage: post.featuredImage?.url,
              tier: post.tier,
              published_at: post.publishedAt,
              type: post.type,
              interviews: post.interviews,
              tools: post.tools,
            };
          });
          return {
            posts,
            count,
          };
        },
      },
    },
  },
  resolversConfig: {
    "Query.userPosts": {
      auth: true, //requires auth
    },
  },
});
