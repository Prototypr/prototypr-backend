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
    //company info
    const { companyName, companyWebsite, contactEmail } = data;
    //job post info
    const { 
      title, 
      description, 
      type,
      link, 
    } = data;

    // location = JSON.parse(location)//just use as as string

    try {
      // check if company already exists,
      // if not, create company
      // a company can only exist once. Check for domain name

      const entries = await strapi.entityService.findMany(
        "api::company.company",
        {
          populate: '*',
          filters: {
            $or: [
              {
                url: companyWebsite,
              },
              {
                name: companyName,
              },
            ],
          },
        }
      );

      const exists = entries.length > 0;

      let companyProfile;
      if (!exists) {
        // create a new companyProfile if it doesn't exist
        companyProfile = await strapi.entityService.create(
          "api::company.company",
          {
            data: {
              name: companyName,
              url: companyWebsite,
              email:contactEmail,
              user:ctx.state.user.id, //company owner
              members:[ctx.state.user.id], //add first member,
            },
          }
        );
      } else {
        // use the retrived companyProfile
        companyProfile = entries[0];
        
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

        if(companyProfile?.id){
          let members = companyProfile?.members
          if(!members){
            members = [ctx.state.user.id]
          }else{
            members.push(ctx.state.user.id)
          }
        

          // add whoever is paying into the company members
          // later when there are subscriptions, company members can have access to company features
          // and company owner could add members to give control
          companyProfile = await strapi.entityService.update(
            "api::company.company",companyProfile.id,
            {
              data: {
                members, //company owner
                email:contactEmail
              },
            }
          );
        }
      }

      if (companyProfile) {

        let fields={
          title: title,
          description:description,
          type:type,
          link: link,
          company: companyProfile?.id,
          user:ctx.state.user.id // job poster
        }
        
        const sponsordPostEntry = await strapi.entityService.create(
          "api::sponsored-post.sponsored-post",
          {
            data: fields
          }
        );
        console.log(sponsordPostEntry)

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
  async updateBookingWeeks(ctx) {
    const data = ctx.request.body;
    const { 
      weeks,
      sponsoredPostId
    } = data;
    try{
      if(!sponsoredPostId){
        ctx.send({ posted: false, message: e.message });
        return false
      }
      const sponsoredPost = await strapi.entityService.findOne(
        "api::sponsored-post.sponsored-post",sponsoredPostId,
        {
          populate:['user'],
        }
      );
      
      if(sponsoredPost.user?.id!==ctx.state.user.id){
        return  ctx.send({
          posted: false,
          message: "You don't have permission to update this job post.",
          // id:jobEntry.id,
          // companyId:companyProfile.id
        });
      }

      let weeksArray=[weeks]
      if(weeks.indexOf(',')){
        weeksArray = weeks.split(',');
      }
      
      const sponsoredPostEntry = await strapi.entityService.update(
        "api::sponsored-post.sponsored-post",
        sponsoredPostId,
        {
          data: {
            weeks:weeksArray
          }
        }
      );

      if (sponsoredPostEntry) {
      return  ctx.send({
          posted: true,
          message: "Job Updated",
          id:sponsoredPostEntry.id,
        });
      }
    }
    catch (e) {
      console.log(e)
      return ctx.send({ posted: false, message: e.message });
    }

  },
  async updateSponsoredPost(ctx) {

    const data = ctx.request.body;
    //company info
    const { companyName, companyWebsite, contactEmail } = data;
    //job post info
    const { 
      title, 
      sponsoredPostId,
      description, 
      type,
      link, 
    } = data;

    if(!sponsoredPostId){
      ctx.send({ posted: false, message: e.message });
      return false
    }

    // let {skills} = data
    // skills = JSON.parse(skills)
    // location = JSON.parse(location)//just use as as string

    try {
      // check if company already exists,
      // if not, create company
      // a company can only exist once. Check for domain name

      const entries = await strapi.entityService.findMany(
        "api::company.company",
        {
          populate: '*',
          filters: {
            $or: [
              {
                url: companyWebsite,
              },
              {
                name: companyName,
              },
            ],
          },
        }
      );

      const exists = entries.length > 0;

      let companyProfile;
      if (!exists) {
        // create a new companyProfile if it doesn't exist
        companyProfile = await strapi.entityService.create(
          "api::company.company",
          {
            data: {
              name: companyName,
              url: companyWebsite,
              email:contactEmail,
              user:ctx.state.user.id, //company owner
              members:[ctx.state.user.id], //add first member,
              image:image
            },
          }
        );
      } else {
        // use the retrived companyProfile
        companyProfile = entries[0];
        
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

        if(companyProfile?.id){
          let members = companyProfile?.members
          if(!members){
            members = [ctx.state.user.id]
          }else{
            members.push(ctx.state.user.id)
          }

          // add whoever is paying into the company members
          // later when there are subscriptions, company members can have access to company features
          // and company owner could add members to give control
          companyProfile = await strapi.entityService.update(
            "api::company.company",companyProfile.id,
            {
              data: {
                members, //company owner
                email:contactEmail
              },
            }
          );
        }
      }

      if (companyProfile) {

        let fields={
          title: title,
          description:description,
          type:type,
          link: link,
          company: companyProfile?.id,
          user:ctx.state.user.id // job poster
        }



        const sponsoredPost = await strapi.entityService.findOne(
          "api::sponsored-post.sponsored-post",sponsoredPostId,
          {
            populate:['user'],
          }
        );

        if(sponsoredPost.user?.id!==ctx.state.user.id){
          return  ctx.send({
            posted: false,
            message: "You don't have permission to update this job post.",
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
            message: "Job Updated",
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
