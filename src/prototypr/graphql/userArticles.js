module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      userPosts: [UserPost]
    }

    type UserPost {
      id: ID
      title: String
      slug: String
      status: String
      date: String
    }
  `,
  resolvers: {
    Query: {
      userPosts: {
        resolve: async (parent, args, context) => {
            const data = await strapi.entityService.findMany('api::post.post',   {
            fields: ['id', 'slug', 'title', 'date', 'status'],
            // populate:['legacyFeaturedImage', 'featuredImage'],
            limit: 100,
            filters: {
              $and: [
                {
                  type:'article',
                  // status:'publish'
                },
                {
                  user: context.state.user?.id
                }
              ]
            }
          });

          return data.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            status: post.status,
            date:post.date
          }));

        }
      }
    },
  },
  resolversConfig: {
    "Query.userPosts": {
      auth: true,//requires auth
    },
  },
  })