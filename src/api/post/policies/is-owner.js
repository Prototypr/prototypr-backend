// path: ./src/policies/is-owner.js
 
module.exports = async(policyContext, config, { strapi }) => {
  
  const id = policyContext.request.url.split("/").pop()
  //fetch post with user populated
  const post = await strapi.entityService.findOne('api::post.post',id, {
    populate: { user: true }
  });
    
  //if admin role yes
  if(policyContext?.state?.user?.role?.type=='admin'){
    return true
  }
  //only logged in user can access, or throw 401
  if (policyContext.state?.user?.id==post.user?.id){
    return true
  }else{
    return 401
  }

};