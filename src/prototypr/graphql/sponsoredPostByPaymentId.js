module.exports = (strapi) => ({
    typeDefs: `
      type Query {
        sponsoredPostByPaymentId(paymentId: String): SponsoredPost
      }
    `,
    resolvers: {
      Query: {
        sponsoredPostByPaymentId: {
            // description: 'Get a SponsoredPost by paymentId',
            // resolverOf: 'application::sponsored-post.sponsored-post.findOne', // Use the correct controller action
            resolve: async (obj, args, context) => {
                console.log(args)
              // Implement your logic to fetch the SponsoredPost by paymentId
              const { paymentId } = args;
              const entry = await strapi.db.query('api::sponsored-post.sponsored-post').findOne({
                // select: ['title', 'description'],
                where: { paymentId},
                // populate: { category: true },
              });         
            return entry;
            },
          },
      },
    },
    resolversConfig: {
      "Query.sponsoredPostByPaymentId": {
        auth: false, //requires auth
      },
    },
  });
  