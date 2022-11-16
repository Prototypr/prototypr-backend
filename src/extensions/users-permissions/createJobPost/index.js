/**
 * Create a Job Post
 * Create Company Profile using company endpoint
 * Create Job Entry using Job endpoint
 *
 *
 * @return {Object}
 */
const fs = require("fs");

const _ = require("lodash");
const utils = require("@strapi/utils");

module.exports = {
  /**
   * delete avatar
   * @param {*} ctx
   */

  async createJobPost(ctx) {
    const data = ctx.request.body;
    const { companyName, companyWebsite, contactEmail } = data;
    const { title, salaryRange, url, tags, location } = data;

    try {
      // check if company already exists,
      // if not, create company
      // a company can only exist once. Check for domain name

      const entries = await strapi.entityService.findMany(
        "api::company-profile.company-profile",
        {
          filters: {
            url: companyWebsite,
          },
        }
      );

      const exists = entries.length > 0;

      let companyProfile;
      if (!exists) {
        // create a new companyProfile if it doesn't exist
        companyProfile = await strapi.entityService.create(
          "api::company-profile.company-profile",
          {
            data: {
              name: companyName,
              url: companyWebsite,
            },
          }
        );
      } else {
        // use the retrived companyProfile
        companyProfile = entries[0];
      }

      if (companyProfile) {
        const jobEntry = await strapi.entityService.create(
          "api::job-entry.job-entry",
          {
            data: {
              SalaryRange: salaryRange,
              title: title,
              url: url,
              tags: tags,
              location: location,
              company: companyProfile?.id,
            },
          }
        );

        if (jobEntry) {
          ctx.send({
            posted: true,
            message: "Job Posted",
          });
        }
      }
    } catch (e) {
      ctx.send({ posted: false, message: e.message });
    }
  },
};
