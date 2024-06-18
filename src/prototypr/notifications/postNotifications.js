const postCreatedNotification = async ({ strapi, user, post }) => {

  await strapi.entityService.create(
    "api::notification.notification",
    {
      data: {
        notifier:[user.id],
        post: post.id,
        entity_type:'post',
        action_type:'publish', //company owner
      },
    }
  );

};

module.exports ={
    postCreatedNotification
}