module.exports = (strapi) => ({
    typeDefs:  `
    type Query {
      adminPosts(status: [String]!, pageSize: Int, offset: Int, user:Int): AdminPosts
      count: Int
    }

    type AdminPosts {

      posts: [AdminPost]
      count: Int
    }

    type AdminPost {
      id: ID
      title: String
      slug: String
      status: String
      date: String
      user: AdminPostUser
    }

    type AdminPostUser {
        id: ID
        username: String
        firstName: String
        secondName: String
        slug: String
      }
  `,
  resolvers: {
    Query: {
     adminPosts: {
        resolve: async (parent, args, context) => {

          let isAllowed = false
        //only give results for admin
        if( context.state.user && context.state.user?.role?.type== "admin"){
          isAllowed = true
        }else if(!context?.state?.user?.role && (context.state.isAuthenticated==true && context?.state?.auth?.credentials?.type=='full-access')){
           isAllowed = true
        }
        if (!isAllowed){
          return {
              posts:null,
              count:0
          }
        }

        const whereFilter =  { type:'article', status:args.status}
        if(args.user){
            whereFilter.user=args.user
        }
          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          const [entries, count] = await strapi.db.query('api::post.post').findWithCount({
            select: ['id', 'slug', 'title', 'date', 'status'],
            where:whereFilter,
            limit:args.pageSize,
            offset:args.offset,
            orderBy: { date: 'DESC' },
            populate: { user: true },
          });     
          let posts = entries.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            status: post.status,
            date:post.date,
            user:post.user
          }));
          return {
            posts,
            count
          }

        }
      },
    },
  },
  resolversConfig: {
    "Query.userPosts": {
      auth: true,//requires auth
    },
  },
  })