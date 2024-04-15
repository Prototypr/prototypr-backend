module.exports = (strapi) => ({
  typeDefs: `
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
        paid: Boolean
    }
  `,
  resolvers: {
    Query: {
      bookedSponsors: {
        resolve: async (parent, args, context) => {
          // console.log(args.productId)
          // const total = await strapi.entityService.count(
          //   "api::sponsored-post.sponsored-post",
          //   {
          //     select: ["id"],
          //     where: {
          //       $and: [
          //         {
          //           products: args.productId,
          //         },
          //         {
          //           paid: true,
          //         }
          //         // {
          //         //   $not: {
          //         //     [args?.sponsorType == "website"
          //         //       ? "websiteProductId"
          //         //       : "newsletterProductId"]: null,
          //         //   },
          //         // },
          //       ],
          //     },
          //   }
          // );


          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db
            .query("api::sponsored-post.sponsored-post")
            .findWithCount({
              select: [
                "id",
                "publishedAt",
                "weeks",
                // "products",
                "paid",
              ],
              where: {
                $and: [
                  {
                    products: {
                      id:parseInt(args.productId,10)
                    },
                  },
                  {
                    paid: true,
                  }
                ],
              },
              // limit: args.pageSize,
              limit: 54,//~weeks in a year
              offset: args.offset,
              // orderBy: { week: 'DESC' },
              // populate: { products: ['id'] },
            });

            console.log('entries', entries)

          let posts = entries.map((post) => {
            return {
              id: post.id,
              weeks: post.weeks,
              publishedAt: post.publishedAt,
              paid: post.paid,
              // productId: post.productId,
              // date:post.date,
            };
          });
          return {
            posts,
            count,
            // total,
          };
        },
      },
    },
  },
  resolversConfig: {
    "Query.bookedSponsors": {
      auth: false, //requires auth
    },
  },
});
