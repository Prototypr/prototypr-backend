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
      productId: String
      banner: String
      featuredImage: String
      company: ID,
      paid: Boolean,
      email: String,
      #members: JSON,
      isMember: Boolean
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
                populate:["members", "payments", "id"]
              },
              user:true,
              // payments:{
              //   sort: 'txnDate:asc',
              // },
              // type:true,
              banner:{
                populate:{url:true}
              },
              featuredImage:{
                populate:{url:true}
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

          let isMember=false
          if(data.length){
            let hasAccess = (context.state.user?.id==data[0]?.user?.id || context.state.user.role.type === "admin")
            //or if user is in the company group
            if (data[0]?.company?.members?.length){
              
              if (data[0].company?.members?.filter(function(e) { 
                return e.id === context.state.user.id; 
              }).length > 0) {
                hasAccess = true
                isMember=true
              }
            }

            let active = false;

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
                email:data[0]?.email,
                title: data[0].title,
                description:data[0].description,
                paid:data[0].paid,
                owner: data[0].user?.id,
                link:data[0].link,
                productId:data[0].productId,
                type:data[0].type,
                active,
                banner:data[0].banner?.url,
                featuredImage:data[0].featuredImage?.url,
                company:data[0].company?.id,
                // members:data[0].company?.members,
                isMember
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
    "Query.userSponsor": {
      auth: true, //requires auth
    },
  },
});
