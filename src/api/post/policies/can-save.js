// path: ./src/policies/is-owner.js

module.exports = async (policyContext, config, { strapi }) => {
  //for admin api:
  if (policyContext?.state?.auth?.credentials?.type == "full-access") {
    return true;
  }
  if (!policyContext.state?.user?.id) {
    return false;
  }

  //if admin role yes
  if (policyContext?.state?.user?.role?.type == "admin") {
    return true;
  }

  const id = policyContext.request.url.split("/").pop();
  //fetch post with user populated
  const post = await strapi.entityService.findOne("api::post.post", id, {
    populate: { user: true },
  });
  // return true

  /**
   * don't allow user to save post with publish status as publish
   * unless it's already set as publish
   */
  if (
    (post?.status == "draft" || post?.status == "pending") &&
    policyContext.request.body?.data?.status == "publish"
  ) {
    //if it's a note, allow it to be published
    if(post?.type=='note'){
      return true
    }
    return false;
  } else if (
    !post?.status &&
    policyContext.request.body?.data?.status == "publish"
  ) {
    //if it's a note, allow it to be published
    if(post?.type=='note'){
      return true
    }
    return false;
  }
  
  /**
   * only admins can change tier
   */
  if (
    policyContext.request.body?.data?.tier &&
    policyContext.request.body?.data?.tier != post?.tier &&
    policyContext?.state?.user?.role?.type != "admin") {
    return false;
  }
  if (
    policyContext.request.body?.data?.publish_date &&
    policyContext?.state?.user?.role?.type != "admin") {
    return false;
  }
  
  
  
  return true;
  
};
