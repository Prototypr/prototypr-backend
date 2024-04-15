/**
 * Create a Job Post
 * Create Company Profile using company endpoint
 * Create Job Entry using Job endpoint
 *
 *
 * @return {Object}
 */
// const fs = require("fs");

// const _ = require("lodash");
const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

module.exports = {
  /**
   * delete avatar
   * @param {*} ctx
   */

  async createSponsoredPost(ctx) {
    const data = ctx.request.body;
    //job post info
    let { 
      title, 
      description, 
      // type,
      sponsorEmail:email,
      // productId,
      productIds,
      products,
      link, 
      companyId
    } = data;


    if(!email){
      email = ctx.state.user.email
    }
    //to create the sponsored post, we need a company profile to link it to
    // this is passed in as companyId
    try {
      //get company by id 
      let companyProfile = await strapi.entityService.findOne( "api::company.company",companyId, {populate: '*'});
      if(!companyProfile){

        //@todo ! check if user has any company

        //if not, create company
        companyProfile = await strapi.entityService.create(
          "api::company.company",
          {
            data: {
              name: ctx.state.user.username,
              url: '',
              email:ctx.state.user.email,
              user:ctx.state.user.id, //company owner
              members:[ctx.state.user.id], //add first member,
            },
          }
        );
      }

      if (companyProfile) {
        // use the retrived companyProfile        
        let companyMember = false
          //if user is not the owner, or part of the team, don't allow them to use this company
          if(companyProfile?.user?.id){
            if(companyProfile.user.id!=ctx.state.user.id){
              companyMember = false
            }else{
              companyMember = true
            }
          } 

          //or if user is in the company group
          if (companyProfile?.members?.length){
            if (companyProfile.members.filter(function(e) { 
              return e.id === ctx.state.user.id; 
            }).length > 0) {
              companyMember = true
            }else{
              companyMember = false
            }
          }

          if(!companyMember){
            throw new ApplicationError('This company is owned by someone else.', { foo: 'bar' });
          }
        // if(companyProfile?.id){
        //   let members = companyProfile?.members
        //   if(!members){
        //     members = [ctx.state.user.id]
        //   }else{
        //     members.push(ctx.state.user.id)
        //   }
        

        //   // add whoever is paying into the company members
        //   // later when there are subscriptions, company members can have access to company features
        //   // and company owner could add members to give control
        //   // companyProfile = await strapi.entityService.update(
        //   //   "api::company.company",companyProfile.id,
        //   //   {
        //   //     data: {
        //   //       members, //company owner
        //   //       email:contactEmail
        //   //     },
        //   //   }
        //   // );
        // }
      }

      /**
       * company exists, so now
       * insert the sponsored post
       */
      if (companyProfile) {

        let fields={
          title: title,
          description:description,
          // type:type,
          link: link,
          productIds:productIds,//lemonsqueezy price id
          email,
          products,
          company: companyProfile?.id,
          user:ctx.state.user.id // job poster
        }
        
        const sponsordPostEntry = await strapi.entityService.create(
          "api::sponsored-post.sponsored-post",
          {
            data: fields
          }
        );

        if (sponsordPostEntry) {
          ctx.send({
            posted: true,
            message: "Sponsored post draft created",
            id:sponsordPostEntry.id,
            companyId:companyProfile.id
          });
        }
      }
    } catch (e) {
      ctx.send({ posted: false, message: e.message });
    }
  },
  async updateSponsoredPost(ctx) {

    const data = ctx.request.body;
    //job post info
    const { 
      title, 
      description, 
      sponsoredPostId,
      productIds,
      products,
      link, 
      companyId
    } = data;

    if(!sponsoredPostId){
      ctx.send({ posted: false, message: 'No Sponsored Post ID' });
      return false
    }

    try {
      // check if company already exists,
      //get company by id 
      let companyProfile = await strapi.entityService.findOne( "api::company.company",companyId, {populate: '*'});

      if(!companyProfile){
        ctx.send({ posted: false, message: 'No Company profile associated' });
        return false
      }
      
      if (companyProfile) {
        let companyMember = false
        //if user is not the owner, or part of the team, don't allow them to use this company
        if(companyProfile?.user?.id){
          if(companyProfile.user.id!=ctx.state.user.id){
            companyMember = false
          }else{
            companyMember = true
          }
        } 

        //or if user is in the company group
        if (companyProfile?.members?.length){
          if (companyProfile.members.filter(function(e) { 
            return e.id === ctx.state.user.id; 
          }).length > 0) {
            companyMember = true
          }else{
            companyMember = false
          }
        }

        if(!companyMember){
          throw new ApplicationError('This company is owned by someone else.', { foo: 'bar' });
        }
      }

      if (companyProfile) {

        let fields={
          title: title,
          description:description,
          link: link,
          products,
          productIds:productIds,//lemonsqueezy price id
          // company: companyProfile?.id, // no need to update company
          // user:ctx.state.user.id // no need to update user
        }

        const sponsoredPost = await strapi.entityService.findOne(
          "api::sponsored-post.sponsored-post",sponsoredPostId,
          {
            populate:['company'],
          }
        );

        if(sponsoredPost.company?.id!==companyProfile?.id){
          return  ctx.send({
            posted: false,
            message: "You don't have permission to update this post.",
            // id:jobEntry.id,
            // companyId:companyProfile.id
          });
        }
        
        const sponsoredPostEntry = await strapi.entityService.update(
          "api::sponsored-post.sponsored-post",
          sponsoredPostId,
          {
            data: fields
          }
        );

        if (sponsoredPostEntry) {
        return  ctx.send({
            posted: true,
            message: "Post Updated",
            id:sponsoredPostEntry.id,
            companyId:companyProfile.id
          });
        }
      }
    } catch (e) {
      return ctx.send({ posted: false, message: e.message });
    }
  }
};
