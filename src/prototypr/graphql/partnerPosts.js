module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      partnerPosts( companyId:ID!, pageSize: Int, offset: Int): PartnerPosts
      count: Int
    }

    type PartnerPosts {

      posts: [PartnerPost]
      count: Int
    }

    type PartnerPost {
      id: ID
      title: String
      featuredImage: String
      published_at: String
      paid: Boolean
    }
  `,
  resolvers: {
    Query: {
      partnerPosts: {
        resolve: async (parent, args, context) => {

          //get company from companyId passed in
          const company = await strapi.entityService.findOne("api::company.company", args.companyId, {populate: '*'});
          //check if user is a member of the company or owner
          if(company?.user?.id!=context.state.user?.id && !company.members.includes(context.state.user?.id)){
            throw new Error('You are not a member of this company')
          }

          if(!company){
            return {
              posts:[],
              count:0
            }
          }
          //get company by user id  
        // const companies = await strapi.entityService.findMany("api::company.company", {
        //   filters: {
        //     members: {
        //       id: {
        //         $in: [context.state.user?.id],
        //       },
        //     },
        //   },
        //   populate: ['sponsored_posts'], // populate sponsored_posts
        // });

        // const allSponsoredPosts = companies.reduce((accumulator, company) => {
        //   return accumulator.concat(company.sponsored_posts);
        // }, []);

        const sponsoredPosts = company.sponsored_posts;

        return{
          posts: sponsoredPosts,
          count: sponsoredPosts?.length
        }
          
          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          // const [entries, count] = await strapi.db.query('api::sponsored-post.sponsored-post').findWithCount({
          //   select: ['id', 'title', 'paid'],
          //   where: {user:context.state.user?.id },
          //   limit:args.pageSize,
          //   offset:args.offset,
          //   // orderBy: { date: 'DESC' },
          //   // populate: { category: true },
          // });           
          // let posts = entries.map(post => ({
          //   id: post.id,
          //   title: post.title,
          //   paid:post.paid,
          //   featuredImage:post.featuredImage?.url,
          //   published_at:post.publishedAt
          // }));
          // return {
          //   posts,
          //   count
          // }

        }
      },
    },
  },
  resolversConfig: {
    "Query.partnerPosts": {
      auth: true,//requires auth
    },
  },
  })