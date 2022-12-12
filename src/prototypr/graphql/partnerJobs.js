module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      partnerJobs( pageSize: Int, offset: Int): PartnerJobs
      count: Int
    }

    type PartnerJobs {

      posts: [PartnerJob]
      count: Int
    }

    type PartnerJob {
      id: ID
      title: String
      published_at: String
    }
  `,
  resolvers: {
    Query: {
      partnerJobs: {
        resolve: async (parent, args, context) => {

          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db.query('api::job.job').findWithCount({
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
            // featuredImage:post.featuredImage?.url,
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
    "Query.partnerJobs": {
      auth: true,//requires auth
    },
  },
  })