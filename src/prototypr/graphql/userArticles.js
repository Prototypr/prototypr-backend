module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      userPosts(status: String!, pageSize: Int, offset: Int): UserPosts
      count: Int
    }

    type UserPosts {

      posts: [UserPost]
      count: Int
    }

    type UserPost {

      id: ID
      title: String
      slug: String
      status: String
      date: String
      featuredImage: String
      tier: Int
      published_at: String
    }
  `,
  resolvers: {
    Query: {
      userPosts: {
        resolve: async (parent, args, context) => {

          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db.query('api::post.post').findWithCount({
            select: ['id', 'slug', 'title', 'date', 'status'],
            where: { type:'article', status:args.status, user:context.state.user?.id },
            limit:args.pageSize,
            offset:args.offset,
            orderBy: { date: 'DESC' },
            // populate: { category: true },
          });           
          let posts = entries.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            status: post.status,
            date:post.date,
            featuredImage:post.featuredImage?.url,
            tier:post.tier,
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
    "Query.userPosts": {
      auth: true,//requires auth
    },
  },
  })