const { postCreatedNotification } = require("../../../../prototypr/notifications/postNotifications");

module.exports = {
  async beforeUpdate(event) {
    const { params } = event;

    const existing = await strapi.entityService.findOne(
      "api::post.post",
      params.where.id,
    );
    /**
     * on published, send email
     */
    if (!existing.publishedAt && params.data.publishedAt) {
      console.log("just published");
      let postId = params.where.id;

      if (postId) {

        const post = await strapi.entityService.findOne(
          "api::post.post",
          postId,
          {
            // fields: ["id"],
            populate: {
              user: {
                fields: ["username", "firstName", "email"],
              },
            },
          }
        );

        const {user} = post

        /**
         * web notification
         */
       await postCreatedNotification({strapi, user, post})

       
       /**
        * email notification
       */
        let templateID = "391";
        let subject = "You're article has been published!";
        let url = `https://prototypr.io/post/${post.slug}`
 
        if(post.type=='tool'){
          templateID = "392";
          subject = "You're tool has been published!";
          url= `https://prototypr.io/toolbox/${post.slug}`
        }
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append(
          "Authorization",
          `Bearer ${process.env.LETTER_DEV_TOKEN}`
        );

        const raw = JSON.stringify({
          documentId: templateID,
          FNAME: user.firstName ? user.firstName : user.username,
          TITLE: post?.title,
          URL: url
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
              to: user.email,
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
};
