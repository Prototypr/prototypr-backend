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
        salarymax: Int
        salarymin: Int
        salaryText: String
        companyName: String
        companyLogo: String
        skills: [JobSkills]
        locations: [JobLocations]
        type: String
    }

    type JobSkills {
        id: ID
        name: String
        slug: String
    }
    type JobLocations {
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
                locations:{
                  populate:["name", "slug"]
                },
              },
            select: ['id', 'slug', 'title', 'date', 'salarymin', 'salarymax', 'type'],
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
          let posts = entries.map(post => {
            
            const jobType = getJobType(post)

            console.log(post.type)
            console.log(jobType)
            return({
            id: post.id,
            title: post.title,
            slug: post.slug,
            date:post.date,
            owner: post.user,
            salarymin:post.salarymin,
            salarymax:post.salarymax,
            salaryText: `$${post.salarymin/1000}k – $${(post.salarymax/1000)}k`,
            // salaryText: `papa`,
            companyName:post.company?.name,
            companyLogo:post.company?.logo?.url,
            skills:post.skills,
            locations:post.locations,
            type:jobType,
            // status: post.status,
            date:post.date,
            published_at:post.publishedAt
          })});
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

  const JOB_TYPES = [
    {
    value:'fulltime',
    name:'Full-time'
    },
    {
    value:'parttime',
    name:'Part-time'
    },
    {
    value:'internship',
    name:'Intern'
    },
    {
    value:'contract',
    name:'Contract'
    },
    {
    value:'volunteer',
    name:'Volunteer'
    },

]

  const getJobType = (post) =>{
    let type = post.type
    for(var x=0;x<JOB_TYPES.length;x++){
      if(JOB_TYPES[x].value===post.type){
        type=JOB_TYPES[x].name
      }
    }
   return type
  }