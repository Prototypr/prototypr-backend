module.exports = (strapi) => ({
  typeDefs: `
    type Query {
      userPost(slug: String!): UserArticle
    }

    type UserArticle {
      id: ID
      title: String
      slug: String
      status: String
      date: String
      content: String
      localizations: JSON
      owner: String
      seo: JSON
      excerpt: String
    }
  `,
  resolvers: {
    Query: {
      userPost: {
        resolve: async (parent, args, context) => {
          const data = await strapi.entityService.findMany("api::post.post", {
            // fields: ['id', 'slug', 'title', 'date', 'status', 'content'],
            populate: ["localizations", "seo"],
            limit: 1,
            filters: {
              $and: [
                {
                  // type:'article',
                  slug: args.slug,
                },
                {
                  user: context.state.user?.id,
                },
              ],
            },
          });

          return {
            id: data[0]?.id,
            title: data[0].title,
            slug: data[0].slug,
            status: data[0].status,
            date: data[0].date,
            content: data[0].content,
            localizations: data[0].localizations,
            owner: data[0].user?.id,
            seo:data[0].seo,
            excerpt:data[0].excerpt,
          };
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
