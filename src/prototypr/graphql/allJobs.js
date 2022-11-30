module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      allJobs(pageSize: Int, offset: Int): JobPosts
      count: Int
      total: Int
    }

    type JobPosts {

      posts: [JobPost]
      count: Int
      total: Int
    }

    type JobPost {
        id: ID
        title: String
        slug: String
        owner: String
        date: String
        companyName: String
        companyLogo: String
        skills: [JobSkills]
    }

    type JobSkills {
        id: ID
        name: String
        slug: String
    }
  `,
  resolvers: {
    Query: {
        allJobs: {
        resolve: async (parent, args, context) => {

           const total =  strapi.entityService.count('api::job.job', {
            select: ['id'],
            where: { 
                $not: {
                    publishedAt: null,
                  },
            },
           });
           
          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db.query('api::job.job').findWithCount({
            populate:{
                company:{
                  populate:["members", "payments", "logo"]
                },
                skills:{
                  populate:["name", "slug"]
                },
            },
            select: ['id', 'slug', 'title', 'date'],
            where: { 
                $not: {
                    publishedAt: null,
                  },
            },
            limit:args.pageSize,
            offset:args.offset,
            orderBy: { date: 'DESC' },
            // populate: { category: true },
          });        
          console.log(entries[0])   
          let posts = entries.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            owner: post.user,
            companyName:post.company?.name,
            companyLogo:post.company?.logo?.url,
            skills:post.skills,
            // status: post.status,
            date:post.date,
            published_at:post.publishedAt
          }));
          return {
            posts,
            count,
            total
          }

        }
      },
    },
  },
  resolversConfig: {
    "Query.allJobs": {
      auth: false,//requires auth
    },
  },
  })