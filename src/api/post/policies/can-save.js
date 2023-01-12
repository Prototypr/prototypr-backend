// path: ./src/policies/is-owner.js

/**
 * don't allow user to save post with publish status as publish
 * unless it's already set as publish (from admin dash)
 */
module.exports = async (policyContext, config, { strapi }) => {

//for admin api:
if(policyContext?.state?.auth?.credentials?.type=='full-access'){
  return true
}
  if(!policyContext.state?.user?.id){
    return false
  }

  //if admin role yes
  if(policyContext?.state?.user?.role?.type=='admin'){
    return true
  }

  const id = policyContext.request.url.split("/").pop()
  //fetch post with user populated
  const post = await strapi.entityService.findOne('api::post.post',id, {
    populate: { user: true }
  });
  // return true
    // if post is a draft, only owner can read it
  if((post?.status=='draft' || post?.status=='pending') && policyContext.request.body?.data?.status=='publish'){
    return false
  }else if (!post?.status && policyContext.request.body?.data?.status=='publish'){
    return false
  }else{
    return true
  }
};
