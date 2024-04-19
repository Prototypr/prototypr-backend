module.exports = (strapi) => ({
  typeDefs: `
    type Query {
      userPostId(id: ID!): UserPostId
    }

    type UserPostId {
      id: ID
      title: String
      slug: String
      status: String
      excerpt: String
      date: String
      content: String
      localizations: JSON
      owner: String
      featuredImage: String
      tier: Int
      published_at: String
      seo: JSON
      type: String
      link: String
      logo: JSON
      legacyLogo: String
      legacyFeaturedImage: String
      gallery: JSON
      deal: JSON
    }
  `,
  resolvers: {
    Query: {
      userPostId: {
        resolve: async (parent, args, context) => {
          const data = await strapi.entityService.findMany("api::post.post", {
            // fields: ['id', 'slug', 'title', 'date', 'status', 'content'],
            populate: ["localizations", "featuredImage", "user", "seo", "logo", "gallery", "legacyMedia","legacyAttributes", "deal"],
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
              seo:data[0].seo,
              type:data[0].type,
              excerpt:data[0].excerpt,
              link:data[0].link,
              logo:data[0].logo,
              gallery:data[0].gallery,
              legacyLogo:data[0]?.legacyMedia?.logoNew,
              legacyFeaturedImage:data[0]?.legacyAttributes?.imgUrl,
              deal:data[0]?.deal
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
    "Query.userPostId": {
      auth: true, //requires auth
    },
  },
});
