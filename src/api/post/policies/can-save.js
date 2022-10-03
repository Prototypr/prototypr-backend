// path: ./src/policies/is-owner.js

/**
 * don't allow user to save post with publish status as publish
 * unless it's already set as publish (from admin dash)
 */
module.exports = async (policyContext, config, { strapi }) => {

  const id = policyContext.request.url.split("/").pop()
  //fetch post with user populated
  const post = await strapi.entityService.findOne('api::post.post',id, {
    populate: { user: true }
  });
  // return true
    // if post is a draft, only owner can read it
  if((post?.status=='draft' || post?.status=='pending') && policyContext.request.body?.data?.status=='publish'){
    return false
  }else{
    return true
  }
};
