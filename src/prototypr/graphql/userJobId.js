module.exports = (strapi) => ({
  typeDefs: `
    type Query {
      userJob(id: ID!): UserJob
    }

    type UserJob {
      id: ID
      title: String
      owner: String
      active: Boolean
    }
  `,
  resolvers: {
    Query: {
      userJob: {
        resolve: async (parent, args, context) => {
          const data = await strapi.entityService.findMany("api::job.job", {
            // fields: ['id', 'slug', 'title', 'date', 'status', 'content'],
            populate: 
            // ["company", "user", "payments"]
            {
              company:{
                populate:["members", "payments"]
              },
              user:true,
              payments:{
                sort: 'txnDate:asc',
              }
            }
            ,
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
            if (data[0]?.members?.length){
              
              if (data[0].members.filter(function(e) { 
                return e.id === context.state.user.id; 
              }).length > 0) {
                hasAccess = true
              }
            }

            let active = false;
            if(hasAccess){
              //check if payment in last 30 days
              if(data[0].payments){

                active = true
                let then = new Date(data[0].payments?.txnDate).getTime()
                let now  = new Date().getTime()
                let thirtyDaysInMilliseconds = 2592000000;


              if (now - then > thirtyDaysInMilliseconds) { 
                active=false
              }
              }

              const res = {
                id: data[0]?.id,
                title: data[0].title,
                owner: data[0].user?.id,
                active
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
