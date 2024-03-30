module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      partnerJobs(companyId:ID!, pageSize: Int, offset: Int): PartnerJobs
      count: Int
    }

    type PartnerJobs {

      posts: [PartnerJob]
      count: Int
    }

    type PartnerJob {
      id: ID
      title: String
      published_at: String
    }
  `,
  resolvers: {
    Query: {
      partnerJobs: {
        resolve: async (parent, args, context) => {

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

          const jobs = company.jobs;

          return{
            posts: jobs,
            count: jobs?.length
          }

          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          // const [entries, count] = await strapi.db.query('api::job.job').findWithCount({
          //   select: ['id', 'title'],
          //   where: {user:context.state.user?.id },
          //   limit:args.pageSize,
          //   offset:args.offset,
          //   // orderBy: { date: 'DESC' },
          //   // populate: { category: true },
          // });           
          // let posts = entries.map(post => ({
          //   id: post.id,
          //   title: post.title,
          //   // featuredImage:post.featuredImage?.url,
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
    "Query.partnerJobs": {
      auth: true,//requires auth
    },
  },
  })