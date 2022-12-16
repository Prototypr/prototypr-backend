module.exports = (strapi) => ({
  typeDefs: `
    type Query {
      userPostId(id: ID!): UserPost
    }

    type UserPostId {
      id: ID
      title: String
      slug: String
      status: String
      date: String
      content: String
      localizations: JSON
      owner: String
      featuredImage: String
      tier: Int
      published_at: String
      seo: JSON
    }
  `,
  resolvers: {
    Query: {
      userPostId: {
        resolve: async (parent, args, context) => {
          const data = await strapi.entityService.findMany("api::post.post", {
            // fields: ['id', 'slug', 'title', 'date', 'status', 'content'],
            populate: ["localizations", "featuredImage", "user", "seo"],
            limit: 1,
            filters: {
              $and: [
                {
                  // type:'article',
                  id: args.id,
                },
                // {
                //   user: context.state.user?.id,
                // },
              ],
            },
          });


          if(context.state.user?.id==data[0]?.user?.id || context.state.user.role.type === "admin"){
            const res = {
              id: data[0]?.id,
              title: data[0].title,
              slug: data[0].slug,
              status: data[0].status,
              date: data[0].date,
              content: data[0].content,
              localizations: data[0].localizations,
              owner: data[0]?.user?.id,
              featuredImage:data[0].featuredImage?.url,
              tier:data[0].tier,
              published_at:data[0].publishedAt,
              seo:data[0].seo
            };

            return res 
          }else{
            //not authorized - not post owner, not admin
            return {
              id:null
            }
          }

        },
      },
    },
  },
  resolversConfig: {
    "Query.userPost": {
      auth: true, //requires auth
    },
  },
});
