// path: ./src/policies/is-owner.js
 
module.exports = async(policyContext, config, { strapi }) => {
  
    const id = policyContext.request.url.split("/").pop()
    
    //fetch post with user populated
    const post = await strapi.entityService.findOne('api::post.post',id, {
      populate: { user: true }
    });
    //for admin api:
    if(policyContext?.state?.auth?.credentials?.type=='full-access'){
      return true
    }
      
    //if admin role yes
    if(policyContext?.state?.user?.role?.type=='admin'){
      return true
    }
    //only logged in user can access, or throw 401
    if (policyContext.state?.user?.id==post.user?.id){
      return true
    }

    //only allow change if they are only changing the post like field
    else if (policyContext.request.body?.data?.like && policyContext.request.body?.data?.like != post?.like){
        
        //make sure they are not changing any other field - only like
        if(Object.keys(policyContext.request.body?.data).length==1){
            //double check the key is like
            if(Object.keys(policyContext.request.body?.data)[0]=='like'){

                return true
            }else{
                return false
            }
        }
        else{
          return false
        }
         
    }
    
    else{
      return 401
    }
  
  };