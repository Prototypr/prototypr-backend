"use strict";
const request = require("request");
const axios = require("axios");
// const fetch = require("node-fetch");
const FormData = require("form-data");
// const got = require('got');
const relatedPosts = require("./prototypr/graphql/relatedPosts");
const relatedArticles = require("./prototypr/graphql/relatedArticles");
const relatedTools = require("./prototypr/graphql/relatedTools");
const relatedNewsletters = require("./prototypr/graphql/relatedNewsletters");
const adminArticles = require("./prototypr/graphql/adminArticles");
const userArticles = require("./prototypr/graphql/userArticles");
const userArticle = require("./prototypr/graphql/userArticle");
const userArticleId = require("./prototypr/graphql/userArticleId");
const userJobId = require("./prototypr/graphql/userJobId");
const userSponsorId = require("./prototypr/graphql/userSponsorId");
const allJobs = require("./prototypr/graphql/allJobs");
const randomPosts = require("./prototypr/graphql/randomPosts");
const popularTags = require("./prototypr/graphql/popularTags");

const bookedSponsors = require("./prototypr/graphql/bookedSponsors");
const activeSponsors = require("./prototypr/graphql/activeSponsors");
const partnerPosts = require("./prototypr/graphql/partnerPosts");
const partnerJobs = require("./prototypr/graphql/partnerJobs");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const relatedPostsExtension = relatedPosts(strapi);
    strapi.plugin("graphql").service("extension").use(relatedPostsExtension);
    const relatedArticlesExtension = relatedArticles(strapi);
    strapi.plugin("graphql").service("extension").use(relatedArticlesExtension);
    const relatedToolsExtension = relatedTools(strapi);
    strapi.plugin("graphql").service("extension").use(relatedToolsExtension);
    const relatedNewslettersExtension = relatedNewsletters(strapi);
    strapi
      .plugin("graphql")
      .service("extension")
      .use(relatedNewslettersExtension);
    // Going to be our custom query resolver to get all authors and their details.
    const userArticlesExtension = userArticles(strapi);
    strapi.plugin("graphql").service("extension").use(userArticlesExtension);

    const allJobsExtension = allJobs(strapi);
    strapi.plugin("graphql").service("extension").use(allJobsExtension);

    const randomPostsExtension = randomPosts(strapi);
    strapi.plugin("graphql").service("extension").use(randomPostsExtension);
    
    const popularTagsExtension = popularTags(strapi);
    strapi.plugin("graphql").service("extension").use(popularTagsExtension);

    const partnerPostsExtension = partnerPosts(strapi);
    strapi.plugin("graphql").service("extension").use(partnerPostsExtension);

    const partnerJobsExtension = partnerJobs(strapi);
    strapi.plugin("graphql").service("extension").use(partnerJobsExtension);

    const bookedSponsorsExtension = bookedSponsors(strapi);
    strapi.plugin("graphql").service("extension").use(bookedSponsorsExtension);
    
    const activeSponsorsExtension = activeSponsors(strapi);
    strapi.plugin("graphql").service("extension").use(activeSponsorsExtension);

    const adminArticlesExtension = adminArticles(strapi);
    strapi.plugin("graphql").service("extension").use(adminArticlesExtension);
    const userArticleExtension = userArticle(strapi);
    strapi.plugin("graphql").service("extension").use(userArticleExtension);

    const userArticleIdExtension = userArticleId(strapi);
    strapi.plugin("graphql").service("extension").use(userArticleIdExtension);

    const userJobIdExtension = userJobId(strapi);
    strapi.plugin("graphql").service("extension").use(userJobIdExtension);

    const userSponsorIdExtension = userSponsorId(strapi);
    strapi.plugin("graphql").service("extension").use(userSponsorIdExtension);
  },

  //set user avatar after create for twitter
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      // your lifecycle hooks
      async afterCreate(data) {
        //clear password and add other profile data

        let slug = data.result.username.replace(/\W+/g, "-");

        // await strapi.services.profile.create({
        //   data: {
        //     password: "",
        //     legacySlug:slug,
        //     availability:false,
        //     mentor:false,
        //     collaborate:false,
        //  },
        //   users_permissions_user: data.result.i
        // });

        await strapi.query("plugin::users-permissions.user").update({
          where: { id: data.result.id },
          data: {
            password: "",
            legacySlug: slug,
            approved:false,
            availability: false,
            mentor: false,
            collaborate: false,
          },
        });

        // let res = await axios.put(
        //   `${process.env.STRAPI_URL}/api/users/${data.result.id}`,
        //   { data: { password: "", legacySlug:slug } },
        //   {
        //     headers: {
        //       Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        //     },
        //   }
        // );

        // var config = {
        //   method: 'post',
        //   url: 'https://app.letter.so/api/mail/getTemplate',
        //   headers: { 
        //   'authorization': 'Bearer YOUR_TOKEN', 
        //   'Content-Type': 'application/json'
        //   },
        //   data : JSON.stringify({
        //   "documentId": "63e39a333aa8183acec58981",
          
        //   })
        //   };

        //welcome email
        // var emailConfig = {
        //   method: "post",
        //   url: `${process.env.LETTER_API_URL}/auth/basicAuth`,
        //   // headers: {
        //   //   'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`,
        //   //   ...fileData.getHeaders(),
        //   // },
        //   data: {
        //     email: process.env.LETTER_USERNAME,
        //     password: process.env.LETTER_PASSWORD,
        //   },
        // };

        // console.log("hi");
        // await axios(emailConfig)
        //   .then(function (response) {
        //     console.log(JSON.stringify(response.data));
        //     (response) => response.json();
        //   })
        //   .catch(function (error) {
        //     console.log(error.message);
        //   });

        //insert twitter image
        if (
          data.params?.data?.provider == "twitter" &&
          data.params?.data?.image &&
          data.result?.id
        ) {
          const fileData = new FormData();
          fileData.append("files", request(data.params.data.image));
          fileData.append("refId", data.result.id);
          fileData.append("ref", "plugin::users-permissions.user");
          fileData.append("source", "users-permissions");
          fileData.append("field", "avatar");

          var config = {
            method: "post",
            url: `${process.env.STRAPI_URL}/api/upload`,
            headers: {
              Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
              ...fileData.getHeaders(),
            },
            data: fileData,
          };

          axios(config)
            .then(function (response) {
              console.log(JSON.stringify(response.data));
              (response) => response.json();
            })
            .catch(function (error) {
              console.log(error.message);
            });
        }
      },
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  // bootstrap(/*{ strapi }*/) {},
};
