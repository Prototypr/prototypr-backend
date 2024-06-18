"use strict";
const request = require("request");
const axios = require("axios");
// const fetch = require("node-fetch");
const FormData = require("form-data");
// const got = require('got');
const relatedPosts = require("./prototypr/graphql/relatedPosts");
const relatedArticles = require("./prototypr/graphql/relatedArticles");
const relatedNews = require("./prototypr/graphql/relatedNews");
const relatedTools = require("./prototypr/graphql/relatedTools");
const relatedNewsletters = require("./prototypr/graphql/relatedNewsletters");
const adminArticles = require("./prototypr/graphql/adminArticles");
const userArticles = require("./prototypr/graphql/userArticles");
const userNotifications = require("./prototypr/graphql/userNotifications");
const creatorArticles = require("./prototypr/graphql/creatorArticles");
const userArticle = require("./prototypr/graphql/userArticle");
const userArticleId = require("./prototypr/graphql/userArticleId");
const userJobId = require("./prototypr/graphql/userJobId");
const userSponsorId = require("./prototypr/graphql/userSponsorId");
const allJobs = require("./prototypr/graphql/allJobs");
const randomPosts = require("./prototypr/graphql/randomPosts");
const popularTags = require("./prototypr/graphql/popularTags");

const sponsoredPostByPaymentId = require("./prototypr/graphql/sponsoredPostByPaymentId");

const bookedSponsors = require("./prototypr/graphql/bookedSponsors");
const activeSponsors = require("./prototypr/graphql/activeSponsors");
const partnerPosts = require("./prototypr/graphql/partnerPosts");
const partnerJobs = require("./prototypr/graphql/partnerJobs");

const extendPostsWithLikeCount = require("./prototypr/graphql/extendPostsWithLikeCount");
const { createNewNotification } = require("./prototypr/notifications/createNewNotification");

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
    const relatedNewsExtension = relatedNews(strapi);
    strapi.plugin("graphql").service("extension").use(relatedNewsExtension);
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
    
    const userNotificationsExtension = userNotifications(strapi);
    strapi.plugin("graphql").service("extension").use(userNotificationsExtension);

    const extendPostsWithLikeCountExtension = extendPostsWithLikeCount(strapi);
    strapi
      .plugin("graphql")
      .service("extension")
      .use(extendPostsWithLikeCountExtension);

    const creatorArticlesExtension = creatorArticles(strapi);
    strapi.plugin("graphql").service("extension").use(creatorArticlesExtension);

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

    const sponsoredPostByPaymentIdExtension = sponsoredPostByPaymentId(strapi);
    strapi
      .plugin("graphql")
      .service("extension")
      .use(sponsoredPostByPaymentIdExtension);
  },

  //set user avatar after create for twitter
  bootstrap({ strapi }) {
    strapi.contentType("plugin::upload.file").attributes.customFieldName = {
      type: "text",
    };
    /**
     * user hooks
     */
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      /**
       * todo! get change from approved to true
       * @param {*} data 
       */
      async beforeUpdate(event){

        
        const {params} = event;
        const id = params?.data?.id

        const newApprovedValue = params?.data?.approved

        if(id){
          const existing = await strapi.entityService.findOne(
            "plugin::users-permissions.user",
            id,
  
          );
  
          if (existing?.approved != newApprovedValue) {
            //do something when value changed
            if(newApprovedValue==true){
              //create notification
              await createNewNotification({
                strapi, user:existing, entity_type: "profile", action_type: "approve"
                })
  
              
  
              //send email
              const myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");
              myHeaders.append(
                "Authorization",
                `Bearer ${process.env.LETTER_DEV_TOKEN}`
              );
      
              const raw = JSON.stringify({
                documentId: 394,
                FNAME:params?.data.firstName?params?.data.firstName:params?.data.username,
                URL:`${process.env.NEXT_URL}/people/${params?.data.slug}`
              });
      
              const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
              };
      
              try {
                const letterResponse = await fetch(
                  "https://new.letter.so/api/mail/getTemplate",
                  requestOptions
                );
                const letterData = await letterResponse.json();
      
                if (letterData?.html) {
                  //send email
                  const sendData = {
                    to: params?.data?.email,
                    from: `Graeme @ Prototypr <hello@prototypr.io>`,
                    replyTo: "hello@prototypr.io",
                    subject: "Your profile has been approved 🙌",
                    // text,
                    html: letterData.html,
                  };
                  await strapi.plugin("email").service("email").send(sendData);
                }
              } catch (error) {
                console.error(error);
              }
                
            } 
        }
          
        }
      },

      // your lifecycle hooks
      async afterCreate(data) {
        //clear password and add other profile data
        let slug = data.result.username.replace(/\W+/g, "-");

        await strapi.query("plugin::users-permissions.user").update({
          where: { id: data.result.id },
          data: {
            password: "",
            legacySlug: slug,
            approved: false,
            availability: false,
            mentor: false,
            collaborate: false,
            pro: false,
            publishedAt: new Date(),
          },
        });

        await createNewNotification({
          strapi, user:data.result, entity_type: "profile", action_type: "request_completion"
          })

        //welcome email
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append(
          "Authorization",
          `Bearer ${process.env.LETTER_DEV_TOKEN}`
        );

        const raw = JSON.stringify({
          documentId: 386,
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        try {
          const letterResponse = await fetch(
            "https://new.letter.so/api/mail/getTemplate",
            requestOptions
          );
          const letterData = await letterResponse.json();

          if (letterData?.html) {
            //send email
            const sendData = {
              to: data.result?.email,
              from: `Graeme @ Prototypr <hello@prototypr.io>`,
              replyTo: "hello@prototypr.io",
              subject: "Get started 🎉",
              // text,
              html: letterData.html,
            };
            await strapi.plugin("email").service("email").send(sendData);
          }
        } catch (error) {
          console.error(error);
        }

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
              // console.log(JSON.stringify(response.data));
              (response) => response.json();
            })
            .catch(function (error) {
              console.log(error.message);
            });
        }
      },
    });

    /**
     * post hooks
     */

    strapi.db.lifecycles.subscribe({
      models: ["api::post.post"],
      async beforeUpdate(event) {
        const { params } = event;

        //When a new person is added as creator
        if (params?.data?.creators?.connect?.length) {
          const creators = params.data.creators.connect;
          for (const creator of creators) {
            // const user = await strapi.query("plugin::users-permissions.user").findOne({ id: creator.id });
            const user = await strapi.entityService.findOne(
              "plugin::users-permissions.user",
              creator.id,
            );
            //you've been added as a creator email
            let templateID = "390";
            let subject="You've been added as a creator!"

            //add creator badge
            let isNewCreator = false
            if (!user.creatorBadge) {
              await strapi.query("plugin::users-permissions.user").update({
                where: { id: creator.id },
                data: { creatorBadge: true },
              });
              //you've got a creator *badge* email
              isNewCreator=true
            }

            const email = user.email;
            //simple 'added you' template
            // check if post has an interview done already
            let interviewInvite= false
            const post = await strapi.entityService.findOne(
              "api::post.post",
              params.data.id,
              {
                fields: ["id"],
                populate: {
                  interviews: {
                    fields: ["id"],
                  },
                },
              }
            );
            //if interview, use added you + do interview template
            if (!post?.interviews.length) {
              // Post has an interview relation
              interviewInvite = true
            }

            /**
             * choose the template
             */
            if(interviewInvite && isNewCreator){
              templateID="388"
              subject="You've got a new creator badge – tell your story! 🎙️"

              await createNewNotification({
                strapi, user, post, entity_type: "badge", action_type: "create"
                })
                await createNewNotification({
                  strapi, user, post, entity_type: "interview", action_type: "invite"
                })

            }else if(interviewInvite && !isNewCreator){
              templateID="389"
              subject="You've been added as a creator – tell your story! 🎙️"

              await createNewNotification({
                strapi, user, post, entity_type: "claim", action_type: "approve"
              })
              await createNewNotification({
                strapi, user, post, entity_type: "interview", action_type: "invite"
              })

            }else if(isNewCreator && !interviewInvite){
              templateID="387"
              subject="You're got a verified creator badge! ✅"

              await createNewNotification({
                strapi, user, post, entity_type: "badge", action_type: "create"
              })
            }else if(!isNewCreator && !interviewInvite){
              await createNewNotification({
                strapi, user, post, entity_type: "claim", action_type: "approve"
              })
            }


            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append(
              "Authorization",
              `Bearer ${process.env.LETTER_DEV_TOKEN}`
            );
    
            const raw = JSON.stringify({
              documentId: templateID,
              FNAME:user.firstName?user.firstName:user.username,
              TOOL:params?.data?.title,
              URL:`${process.env.NEXT_URL}/toolbox/post/${params?.data?.id}/interview`
            });
            
            const requestOptions = {
              method: "POST",
              headers: myHeaders,
              body: raw,
              redirect: "follow",
            };
    
            try {
              const letterResponse = await fetch(
                "https://new.letter.so/api/mail/getTemplate",
                requestOptions
              );
              const letterData = await letterResponse.json();
    
              if (letterData?.html) {
                //send email
                const sendData = {
                  to: email,
                  from: `Graeme @ Prototypr <hello@prototypr.io>`,
                  replyTo: "hello@prototypr.io",
                  subject: subject,
                  // text,
                  html: letterData.html,
                };
                await strapi.plugin("email").service("email").send(sendData);
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      },
    });
  },
};
