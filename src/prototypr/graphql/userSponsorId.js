module.exports = (strapi) => ({
  typeDefs: `
    type Query {
      userSponsor(id: ID!): UserSponsor
    }

    type UserSponsor {
      id: ID
      title: String
      owner: String
      active: Boolean
      description: String
      link: String
      type: String
      banner: String
      featuredImage: String
    }
  `,
  resolvers: {
    Query: {
      userSponsor: {
        resolve: async (parent, args, context) => {
          const data = await strapi.entityService.findMany("api::sponsored-post.sponsored-post", {
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
              },
              type:true,
              banner:{
                populate:'url'
              },
              featuredImage:{
                populate:'url'
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
            console.log(data[0])
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

            console.log(hasAccess)
            if(hasAccess){
              //check if payment in last 30 days
              if(data[0].payments?.length){

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
                description:data[0].description,
                owner: data[0].user?.id,
                link:data[0].link,
                type:data[0].type,
                active,
                banner:data[0].banner?.url,
                featuredImage:data[0].featuredImage?.url
              };
              console.log(res)
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
    "Query.userSponsor": {
      auth: true, //requires auth
    },
  },
});
