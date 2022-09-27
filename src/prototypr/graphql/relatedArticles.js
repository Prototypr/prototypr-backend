module.exports = (strapi) => {
    return () => ({
        typeDefs: `
        type Post {
          relatedArticles: [Post]
        }
        `,
        resolvers: {
          Post: {
            async relatedArticles({id}) {
    
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
                        type:'article',
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
                if(!relatedPosts.length){
                  relatedPosts = await getMorePosts(id);
                }
              } else{
                relatedPosts = await getMorePosts(id)
              }
              return relatedPosts
            },
          },
        },
      });
} 


const getMorePosts = async (id)=> {
let relatedPosts = []
const morePosts =  await strapi.entityService.findMany('api::post.post',   {
    fields: ['id', 'slug', 'title', 'date'],
    populate:['legacyFeaturedImage', 'featuredImage'],
    limit: 4,
    filters: {
      $and: [
        {
          type:'article',
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
  if(morePosts.length){
    relatedPosts = morePosts
  }

  return relatedPosts
}