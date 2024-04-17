module.exports = (strapi) => {
    return () => ({
        typeDefs: `
        type Post {
          relatedNews: [Post]
        }
        `,
        resolvers: {
          Post: {
            async relatedNews({id}) {
    
              //fetch again the single product, but with the tags field
              const postWithTags = await strapi.entityService.findOne('api::post.post',id, {
                fields: ['id'],
                populate: { tags: true }
              });
            
              //if there is tags, find posts with the same tags
              let relatedPosts=[]
              const types = ["bite", "post", "tool"];
   
              if(postWithTags.tags?.length){
                //get tags into an array of slugs, e.g. ['ux','ui','code']
                const tagSlugs = postWithTags.tags.map(tag => tag.slug)

                for (var i = 0; i < types.length; i++) {
                    let foundPosts = await strapi.entityService.findMany('api::post.post',   {
                     fields: ['id', 'slug', 'title', 'date', 'type'],
                     populate:['legacyFeaturedImage', 'featuredImage'],
                     limit: 4,
                     where: { 
                       $not: {
                           publishedAt: null,
                         },
                     },
                     filters: {
                       $and: [
                         {
                           type:types[i]
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
                   relatedPosts = [...relatedPosts, ...foundPosts]
                }
                if(!relatedPosts.length){
                  relatedPosts = await getMorePosts(id);
                }
              } else{
                relatedPosts = await getMorePosts(id)
              }
              console.log(relatedPosts)
              return relatedPosts?.splice(0,4)
            },
          },
        },
      });
} 


const getMorePosts = async (id)=> {
let relatedPosts = []
const morePosts =  await strapi.entityService.findMany('api::post.post',   {
    fields: ['id', 'slug', 'title', 'date', 'type'],
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