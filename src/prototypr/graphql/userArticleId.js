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
    }
  `,
  resolvers: {
    Query: {
      userPostId: {
        resolve: async (parent, args, context) => {
          const data = await strapi.entityService.findMany("api::post.post", {
            // fields: ['id', 'slug', 'title', 'date', 'status', 'content'],
            populate: ["localizations", "featuredImage", "user"],
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
            return {
              id: data[0]?.id,
              title: data[0].title,
              slug: data[0].slug,
              status: data[0].status,
              date: data[0].date,
              content: data[0].content,
              localizations: data[0].localizations,
              owner: data[0]?.user?.id,
            };
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
