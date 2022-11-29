module.exports = (strapi) => ({
  typeDefs: `
    type Query {
      userJob(id: ID!): UserJob
    }

    type UserJob {
      id: ID
      title: String
      owner: String
    }
  `,
  resolvers: {
    Query: {
      userJob: {
        resolve: async (parent, args, context) => {
          const data = await strapi.entityService.findMany("api::job.job", {
            // fields: ['id', 'slug', 'title', 'date', 'status', 'content'],
            populate: ["company", "user"],
            limit: 1,
            filters: {
              $and: [
                {
                  id: args.id,
                }
              ],
            },
          });

          if(data.length){
            

            let hasAccess = (context.state.user?.id==data[0]?.user?.id || context.state.user.role.type === "admin")
            //or if user is in the company group
            const co = await strapi.entityService.findOne(
              "api::company.company",
              data[0].company?.id,
              { populate: ["members"] }
            );
            if (co?.members?.length){
              
              if (co.members.filter(function(e) { 
                return e.id === context.state.user.id; 
              }).length > 0) {
                hasAccess = true
              }
            }
            
            if(hasAccess){
              const res = {
                id: data[0]?.id,
                title: data[0].title,
                owner: data[0].user?.id
              };
              return res 
  
            }else{
              //not authorized - not post owner, not admin
              return {
                id:null
              }
            }
          }
            return {
              id:null
            }

        },
      },
    },
  },
  resolversConfig: {
    "Query.userJob": {
      auth: true, //requires auth
    },
  },
});
