// path: ./src/policies/is-owner.js

/**
 * if post is a draft
 * only allow the owner to read it
 */
module.exports = async (policyContext, config, { strapi }) => {
  // const id = policyContext.request.url.split("/").pop()
  // //fetch post with user populated
  //if admin role yes
  if(policyContext?.state?.user?.role?.type=='admin'){
    return true
  }

  const posts = await strapi.entityService.findMany(
    "api::post.post",
    policyContext.request.query,
    { fields: ["user", "status"], 
    populate: { user: true, status:true } }
  );
  const post = posts[0]
    // if post is a draft, only owner can read it
  if(post?.status=='draft'){
    if(policyContext.state?.user?.id == post.user?.id){
      return true
    }else{
      return false
    }
  }else{
    return true
  }
};
