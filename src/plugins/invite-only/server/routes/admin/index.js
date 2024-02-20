// Tip: This is an admin route, which means that it will be directly accessible from the admin. Not from the outside (/api/...)
// https://strapi.io/blog/how-to-create-a-strapi-v4-plugin-admin-customization-5-6

module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/get-users-invites',
      handler: 'inviteTokenController.getUsersWithInvites',
      config: {
        policies:[]
          // policies: ["plugin::invite-only.isAdmin"],
      },
    },
    {
      method: 'POST',
      path: '/generate-invite-token',
      handler: 'inviteTokenController.generate',
      config: {
        policies:[]
          // policies: ["plugin::invite-only.isAdmin"],
      },
    },
  ],
 };