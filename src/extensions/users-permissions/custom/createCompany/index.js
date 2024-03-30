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

  async createCompany(ctx) {
    const data = ctx.request.body;
    //company info
    const { companyName, companyWebsite, contactEmail } = data;


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
                email:contactEmail,
                url:companyWebsite,
                name:companyName
              },
            }
          );
        }
      }

      if (companyProfile) {
        ctx.send({
            posted: true,
            message: "Company saved",
            companyId:companyProfile.id
          });
      }
    } catch (e) {
      ctx.send({ posted: false, message: e.message });
    }
  },
  async updateCompany(ctx) {

    const data = ctx.request.body;
    //company info
    const { companyName, companyWebsite, contactEmail, companyId } = data;

    try {
      // check if company already exists
      const company = await strapi.entityService.findOne( "api::company.company",companyId, {populate: '*'});

      console.log(company)
      if(company){

        //check if user is owner or member of company
        let companyMember = false
          //if user is not the owner, or part of the team, don't allow them to use this company
          if(company?.user?.id){
            if(company.user.id!=ctx.state.user.id){
              companyMember = false
            }else{
              companyMember = true
            }
          } 
          
          //or if user is in the company group
          if (company?.members?.length){
            if (company.members.filter(function(e) { 
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

          // update companyProfile if it exists
          const companyProfile = await strapi.entityService.update(
            "api::company.company",companyId,
            {
              data: {
                name: companyName,
                url: companyWebsite,
                email:contactEmail
              },
            }
          );
          if (companyProfile) {
    
            return  ctx.send({
                posted: true,
                message: "Company saved",
                id:companyProfile.id,
                companyId:companyProfile.id
              });
    
          }
        }else{
          throw new ApplicationError('This company is owned by someone else.', { foo: 'bar' });
        }

      } catch (e) {
      return ctx.send({ posted: false, message: e.message });
    }
  }
};
