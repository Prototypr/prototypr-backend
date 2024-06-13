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
    const post = await strapi.entityService.findOne("api::like.like", id, {
      populate: { user: true },
    });
    // return true
    
    return true;
    
  };
  