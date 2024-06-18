const {
  createNewNotification,
} = require("../../../../prototypr/notifications/createNewNotification");

module.exports = {
  async afterCreate(event) {
    if (event.result.id) {
      console.log("liked");

      let likeId = event.result.id;

      if (likeId) {
        const likeEntry = await strapi.entityService.findOne(
          "api::like.like",
          likeId,
          {
            // fields: ["id"],
            populate: {
              user: {
                fields: ["id", "username", "firstName"],
                populate: {
                  avatar: true,
                },
              },
              post: {
                fields: [
                  "id",
                  "slug",
                  "title",
                  "date",
                  "status",
                  "type",
                  "excerpt",
                ],
                populate: {
                  featuredImage: true,
                  creators: {
                    fields: ["id", "username", "firstName"],
                    populate: {
                      avatar: true,
                    },
                  },
                },
              },
            },
          }
        );

        const { post } = likeEntry;
        const { creators } = post;

        console.log(creators);

        /**
         * web notification
         */
        await createNewNotification({
          strapi,
          creators,
          post,
          actor: likeEntry.user.id,
          entity_type: "like",
          action_type: "create",
        });
      }
    }
  },
};
