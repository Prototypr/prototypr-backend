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
  // must be logged in
  if(!policyContext.state?.user?.id){
    return false
  }

  //can't create as someone else
  if(policyContext.request.body?.data?.user!=policyContext.state?.user?.id){
    return false
  }

    // can't create with publish status
  if(policyContext.request.body?.data?.status=='publish'){
    return false
  }else{
    return true
  }
};
