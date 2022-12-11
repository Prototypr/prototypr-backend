module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      bookedSponsors(pageSize: Int, offset: Int): SponsoredPosts
      count: Int
      total: Int
    }

    type SponsoredPosts {

      posts: [SponsoredPost]
      count: Int
      total: Int
    }

    type SponsoredPost {
        id: ID
        weeks: JSON
        publishedAt: DateTime
    }
  `,
  resolvers: {
    Query: {
      bookedSponsors: {
        resolve: async (parent, args, context) => {

           const total =  strapi.entityService.count('api::sponsored-post.sponsored-post', {
            select: ['id'],
            where: { 
                $not: {
                  week: null,
                  },
            },
           });
           
          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db.query('api::sponsored-post.sponsored-post').findWithCount({
            select: ['id', 'publishedAt', 'weeks'],
            where: { 
                $not: {
                    weeks: null,
                  },
            },
            limit:args.pageSize,
            offset:args.offset,
            // orderBy: { week: 'DESC' },
            // populate: { category: true },
          });        
          
          let posts = entries.map(post => {
            
            return({
            id: post.id,
            weeks:post.weeks,
            publishedAt:post.publishedAt
            // date:post.date,
          })});
          return {
            posts,
            count,
            total
          }

        }
      },
    },
  },
  resolversConfig: {
    "Query.bookedSponsors": {
      auth: false,//requires auth
    },
  },
  })