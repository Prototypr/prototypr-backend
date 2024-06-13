// path: ./src/policies/is-owner.js

/**
 * don't allow user to save post with publish status as publish
 * unless it's already set as publish (from admin dash)
 */
module.exports = async (policyContext, config, { strapi }) => {
  //for admin api:
  if (policyContext?.state?.auth?.credentials?.type == "full-access") {
    return true;
  }
  if (policyContext?.state?.user?.role?.type == "admin") {
    return true;
  }
  // must be logged in
  if (!policyContext.state?.user?.id) {
    return false;
  }

  //can't create a new like if it already exists
  //likes must have a post id to create
  const id = policyContext.request.url.split("?post=").pop();

  const like = await strapi.entityService.findOne("api::like.like", id, {
    populate: { user: true },
  });

  if(like?.id){
    //like already exists for this post
    return false
  }

  return true;
};
