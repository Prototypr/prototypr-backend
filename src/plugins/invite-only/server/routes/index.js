// module.exports = [
//   {
//     method: 'GET',
//     path: '/',
//     handler: 'myController.index',
//     config: {
//       policies: [],
//       auth:false
//     },
//   },
//   {
//     method: 'POST',
//     path: '/generate-invite-token',
//     handler: 'inviteTokenController.generate',
//     config: {
//       policies: [],
//       // auth:false
//     },
//   },
// ];

// https://savaslabs.com/blog/using-strapi-v4-api-tokens-validate-custom-plugin-routes
'use strict';

module.exports = {
  // admin: require('./admin'),
  'content-api': require('./content-api'),
};

