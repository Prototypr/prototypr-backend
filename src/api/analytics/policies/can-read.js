// path: ./src/policies/is-owner.js

/**
 * if post is a draft
 * only allow the owner to read it
 */
module.exports = async (policyContext, config, { strapi }) => {
  //make sure token is present, or logged in (send api key in header request from next app)
  if(policyContext.state?.auth?.credentials){
    if(policyContext.state?.auth?.credentials?.id){
      return true
    }

  }else{
    return false
  }
};
