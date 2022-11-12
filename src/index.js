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
const userArticles = require("./prototypr/graphql/userArticles");
const userArticle = require("./prototypr/graphql/userArticle");
const userArticleId = require("./prototypr/graphql/userArticleId");

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
    const userArticleExtension = userArticle(strapi);
    strapi.plugin("graphql").service("extension").use(userArticleExtension);

    const userArticleIdExtension = userArticleId(strapi);
    strapi.plugin("graphql").service("extension").use(userArticleIdExtension);
  },

  //set user avatar after create for twitter
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      // your lifecycle hooks
      async afterCreate(data) {
        //clear password and add other profile data

        let slug=data.result.username.replace(/\W+/g, '-')

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

        // await strapi.query('plugin::users-permissions.user').update({
        //   where: {id: data.result.id},
        //   data: {
        //     password: "",
        //     legacySlug:slug,
        //     availability:false,
        //     mentor:false,
        //     collaborate:false,
        //  }
        // })

        let res = await axios.put(
          `${process.env.STRAPI_URL}/api/users/${data.result.id}`,
          { data: { password: "", legacySlug:slug } },
          {
            headers: {
              Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
            },
          }
        );


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
