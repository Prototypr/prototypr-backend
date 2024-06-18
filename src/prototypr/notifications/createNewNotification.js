const createNewNotification = async ({
  strapi,
  user,
  creators,
  actor,
  post,
  entity_type,
  action_type,
}) => {
  let notificationData = {
    entity_type: entity_type,
    action_type: action_type,
  };

  if (post) {
    notificationData.post = post.id;
  }

  if (actor) {
    notificationData.actor = actor.id;
  }

  if(creators?.length){
    notificationData.notifiers = creators.map((u) => u.id);
  }else if (user?.id){
    notificationData.notifiers = [user.id]
  }

  await strapi.entityService.create("api::notification.notification", {
    data: notificationData,
  });
};

module.exports = {
  createNewNotification,
};
