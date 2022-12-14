module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      activeSponsors(type: String, pageSize: Int, offset: Int): ActiveSponsors
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
    }
  `,
  resolvers: {
    Query: {
      activeSponsors: {
        resolve: async (parent, args, context) => {

          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db.query('api::sponsored-post.sponsored-post').findWithCount({
            select: ['id', 'publishedAt','link', 'weeks', 'type', 'title', 'description'],
            where: { 
              $and: [
                {type:args.type},
                {active:true}
              ]
            },
            limit:args.pageSize,
            offset:args.offset,
            populate:{
                banner:{
                    populate:{url:true}
                },
                featuredImage:{
                    populate:{url:true}
                }
            }
          });        
          
          let posts = entries.map(post => {
            
            return({
            id: post.id,
            title: post.title,
            description: post.description,
            weeks:post.weeks,
            publishedAt:post.publishedAt,
            type:post.type,
            featuredImage:post.featuredImage.url,
            banner:post.banner.url,
            link:post.link
          })});
          return {
            posts,
            count,
            // total
          }

        }
      },
    },
  },
  resolversConfig: {
    "Query.activeSponsors": {
      auth: false,//requires auth
    },
  },
  })