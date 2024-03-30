module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      bookedSponsors(productId: String, pageSize: Int, offset: Int): SponsoredPosts
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

           const total = await strapi.entityService.count('api::sponsored-post.sponsored-post', {
            select: ['id'],
            where: { 
              $and: [
                {productId:args.productId},
                {$not: {
                  weeks: null,
                  },}
              ]
            },
           });

           
          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db.query('api::sponsored-post.sponsored-post').findWithCount({
            select: ['id', 'publishedAt', 'weeks', 'productId', 'paid'],
            where: { 
              $and: [
                {productId:args.productId},
                {$not: {
                  weeks: null,
                  },}
              ]
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
            publishedAt:post.publishedAt,
            productId:post.productId
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