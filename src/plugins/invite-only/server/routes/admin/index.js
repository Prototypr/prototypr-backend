module.exports = {
    type: 'admin',
    routes: [
      {
        method: 'POST',
        path: '/generate-invite-token',
        handler: 'inviteTokenController.generate',
        config: {
          policies: [],
        },
      },
    ],
   };