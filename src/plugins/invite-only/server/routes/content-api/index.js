module.exports = {
    type: 'content-api',
    routes: [
      //do these from admin routes 

      // {
      //   method: 'GET',
      //   path: '/get-users-invites',
      //   handler: 'inviteTokenController.getUsersWithInvites',
      //   config: {
      //       policies: ["plugin::invite-only.isAdmin"],
      //   },
      // },
      {
        method: 'POST',
        path: '/generate-invite-token',
        handler: 'inviteTokenController.generate',
        config: {
            policies: ["plugin::invite-only.isAdmin"],
        },
      },
      {
        "method": "POST",
        "path": "/check-token",
        "handler": "inviteTokenController.checkToken",
        "config": {
          "auth": false
        }
      },
      {
        "method": "POST",
        "path": "/use-token",
        "handler": "inviteTokenController.useToken",
        "config": {
            policies: ["plugin::invite-only.isAdmin"],//admin only
        }
      }
    ],
   };