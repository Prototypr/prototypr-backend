module.exports = (strapi) => {
    return () => ({
        typeDefs: `
        type Post {
          relatedNewsletters: [Post]
        }
        `,
        resolvers: {
          Post: {
            async relatedNewsletters({id}) {
    
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
                  populate:['legacyFeaturedImage', 'featuredImage'],
                  limit: 4,
                  filters: {
                    $and: [
                      {
                        type:'newsletter',
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
                  populate:['legacyFeaturedImage', 'featuredImage'],
                  limit: 4,
                  filters: {
                    $and: [
                      {
                        type:'newsletter',
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