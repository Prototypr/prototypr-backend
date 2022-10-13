'use strict';
var axios = require('axios');

/**
 * analytics service.
 */

module.exports = {
checkNotification: async (url) => {
    try {
      
        //call plausible
        //'https://analytics.prototypr.io/api/v1/stats/aggregate?site_id=4.prototypr.io&filters=event:page%3D%3D%2Fpost/future-design-open-source-figma&metrics=pageviews&period=custom&date='
       
        let pageUrl = url
        //remove first slash
        if(pageUrl.charAt(0)=='/'){
            pageUrl = pageUrl.substring(1);
        }
        var todayDate = new Date().toISOString().slice(0, 10);

        const plausibleEndpoint = `${process.env.PLAUSIBLE_URL}/api/v1/stats/aggregate?site_id=${process.env.PLAUSIBLE_SITE_ID}&period=custom&date=2021-01-01,${todayDate}&filters=event:page%3D%3D%2F${pageUrl}&metrics=pageviews`

        var config = {
        method: 'get',
        url: plausibleEndpoint,
        headers: { 
            'Authorization': `Bearer ${process.env.PLAUSIBLE_API_KEY}`
        }
        };

      const plausibleData =  await axios(config)
        .then(function (response) {
            return (response.data)
        })
        .catch(function (error) {
        console.log(error?.message);
        return err
        });

        const slug = pageUrl?.split("/").pop()
        //get post
        const posts = await strapi.entityService.findMany(
            "api::post.post",
            { 
                fields: ['id', 'slug', 'title', 'date', 'postViewMilestone'],
                filters: {
                slug:{
                    $eq:slug
                    }
                },
                populate: {
                user:{
                    fields:['id', 'email'],
                    populate:['notifications']
                },
                }
            }   
            );
            const post = posts[0]
          if(!post?.id){
            return `${JSON.stringify(plausibleData)}` 
          }

        //first email = 100 views - add 5 extra for leeway
        if(plausibleData?.results?.pageviews?.value>100 
            && plausibleData?.results?.pageviews?.value<105
            ){
            //check if user is subscribed to post view notifications
                //if notificatiosn is null, true is the default
               if(post?.user?.notifications===null || post?.user?.notifications?.postViewMilestone==true){

                //check if this milestone has been sent already (if the post has milestone value)
                if(parseInt(post?.postViewMilestone)!==100){
                    //send the email!
                    console.log('sending mail')
                    //send transactional email from Letter
                    //use api key
                    // {templateId:4823, to_name:user.name, email:user.email}

                    //store milestone hit
                    const updatePostMilestone = await strapi.entityService.update('api::post.post', post.id, {
                        data: {
                            postViewMilestone: 100,
                        },
                      }).then((updated)=>{
                        console.log(updated)
                      });
                }

               }

        }




        
        return `${JSON.stringify(plausibleData)}`
    } catch (err) {
      return err;
    }
  },
};