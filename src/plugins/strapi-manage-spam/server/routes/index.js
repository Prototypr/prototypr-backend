// module.exports = [
//   {
//     method: 'GET',
//     path: '/',
//     handler: 'myController.index',
//     config: {
//       policies: [],
//     },
//   },
// ];

'use strict';

module.exports = {
  admin: require('./admin'),
  // 'content-api': require('./content-api'),
};

