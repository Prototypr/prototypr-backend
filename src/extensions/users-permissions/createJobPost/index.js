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

  async createJobPost(ctx) {
    const data = ctx.request.body;
    //company info
    const { companyName, companyWebsite, contactEmail } = data;
    //job post info
    const { 
      title, 
      location,
      description, 
      type,
      salaryMin, 
      salaryMax, 
      url, 
      image
    } = data;

    let {skills} = data
    skills = JSON.parse(skills)
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
          location: location,
          description:description,
          type:type,
          salarymin: salaryMin,
          salarymax: salaryMax,
          url: url,
          skills: skills,
          image:image,
          company: companyProfile?.id,
          user:ctx.state.user.id // job poster
        }
        
        const jobEntry = await strapi.entityService.create(
          "api::job.job",
          {
            data: fields
          }
        );

        if (jobEntry) {
          ctx.send({
            posted: true,
            message: "Job Posted",
            id:jobEntry.id,
            companyId:companyProfile.id
          });
        }
      }
    } catch (e) {
      ctx.send({ posted: false, message: e.message });
    }
  },
};
