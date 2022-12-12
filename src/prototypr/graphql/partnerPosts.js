module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      partnerPosts( pageSize: Int, offset: Int): PartnerPosts
      count: Int
    }

    type PartnerPosts {

      posts: [PartnerPost]
      count: Int
    }

    type PartnerPost {
      id: ID
      title: String
      featuredImage: String
      published_at: String
    }
  `,
  resolvers: {
    Query: {
      partnerPosts: {
        resolve: async (parent, args, context) => {

          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db.query('api::sponsored-post.sponsored-post').findWithCount({
            select: ['id', 'title'],
            where: {user:context.state.user?.id },
            limit:args.pageSize,
            offset:args.offset,
            // orderBy: { date: 'DESC' },
            // populate: { category: true },
          });           
          let posts = entries.map(post => ({
            id: post.id,
            title: post.title,
            featuredImage:post.featuredImage?.url,
            published_at:post.publishedAt
          }));
          return {
            posts,
            count
          }

        }
      },
    },
  },
  resolversConfig: {
    "Query.partnerPosts": {
      auth: true,//requires auth
    },
  },
  })