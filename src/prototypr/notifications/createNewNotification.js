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

  if (actor?.id) {
    notificationData.actor = actor.id;
  }else if(actor){
    notificationData.actor = actor
  }

 if (user?.id){
    notificationData.notifiers = [user.id]
  }

  await strapi.entityService.create("api::notification.notification", {
    data: notificationData,
  });
};

module.exports = {
  createNewNotification,
};
