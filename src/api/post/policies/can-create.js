// path: ./src/policies/is-owner.js

/**
 * don't allow user to save post with publish status as publish
 * unless it's already set as publish (from admin dash)
 */
module.exports = async (policyContext, config, { strapi }) => {

  // must be logged in
  if(!policyContext.state?.user?.id){
    return false
  }

    // can't create with publish status
  if(policyContext.request.body?.data?.status=='publish'){
    return false
  }else{
    return true
  }
};
