module.exports = (strapi) => {
    return () => ({
        typeDefs: `
        type Post {
          relatedTools: [Post]
        }
        `,
        resolvers: {
          Post: {
            async relatedTools({id}) {
    
              //fetch again the single product, but with the tags field
              const postWithTags = await strapi.entityService.findOne('api::post.post',id, {
                fields: ['id'],
                populate: { tags: true }
              });
            
              //if there is tags, find posts with the same tags
              let relatedPosts=[]
              if(postWithTags.tags?.length){
                //get tags into an array of slugs, e.g. ['ux','ui','code']
                const tagSlugs = postWithTags.tags.map(tag => tag.slug)
                 relatedPosts = await strapi.entityService.findMany('api::post.post',   {
                  fields: ['id', 'slug', 'title', 'date'],
                  populate:['legacyFeaturedImage', 'featuredImage','legacyMedia', 'legacyAttributes'],
                  limit: 4,
                  filters: {
                    $and: [
                      {
                        type:'tool',
                        status:'publish'
                      },
                      {
                        tags: {
                          slug:{
                            $in:tagSlugs
                          }
                        },
                      },
                      {
                        id: {
                          $not:id
                        },
                      }
                    ]
                  }
                });
              } else{
                relatedPosts = await strapi.entityService.findMany('api::post.post',   {
                  fields: ['id', 'slug', 'title', 'date'],
                  populate:['legacyFeaturedImage', 'featuredImage', 'legacyMedia','legacyAttributes'],
                  limit: 4,
                  filters: {
                    $and: [
                      {
                        type:'tool',
                        status:'publish'
                      },
                      {
                        id: {
                          $not:id
                        },
                      },
                    ]
                  }
                });
              }
              return relatedPosts
            },
          },
        },
      });
} 