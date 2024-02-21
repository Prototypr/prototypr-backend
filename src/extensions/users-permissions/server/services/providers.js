'use strict';

/**
 * Module dependencies.
 */

// Public node modules.
const _ = require('lodash');
const urlJoin = require('url-join');
const axios = require("axios");//prototypr

const { getAbsoluteServerUrl } = require('@strapi/utils');

module.exports = ({ strapi }) => {
  // lazy load heavy dependencies
  const providerRequest = require('./providers-list');

  /**
   * Helper to get profiles
   *
   * @param {String}   provider
   */

  const getProfile = async (provider, query) => {
    const access_token = query.access_token || query.code || query.oauth_token;

    const providers = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'grant' })
      .get();

    return providerRequest({ provider, query, access_token, providers });
  };

  /**
   * Connect thanks to a third-party provider.
   *
   *
   * @param {String}    provider
   * @param {String}    access_token
   *
   * @return  {*}
   */

  const connect = (provider, query) => {
    const access_token = query.access_token || query.code || query.oauth_token;

    return new Promise((resolve, reject) => {
      if (!access_token) {
        return reject({ message: 'No access_token.' });
      }

      // Get the profile.
      getProfile(provider, query)
        .then(async profile => {
          const email = _.toLower(profile.email);

          // We need at least the mail.
          if (!email) {
            return reject({ message: 'Email was not available.' });
          }

          try {
            const users = await strapi.query('plugin::users-permissions.user').findMany({
              where: { email },
            });

            const advanced = await strapi
              .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
              .get();

            const user = _.find(users, { provider });

            if (_.isEmpty(user) && !advanced.allow_register) {
              return reject({ message: 'Register action is actually not available.' });
            }

            if (!_.isEmpty(user)) {
              return resolve(user);
            }

            if (
              !_.isEmpty(_.find(users, user => user.provider !== provider)) &&
              advanced.unique_email
            ) {
              return reject({ message: 'Email is already taken.' });
            }

            // Retrieve default role.
            const defaultRole = await strapi
              .query('plugin::users-permissions.role')
              .findOne({ where: { type: advanced.default_role } });


            /**
             * prototoypr invite only check
             */
            //prototypr mod - check for invite token before creating user
            const invite_code = query?.invite_code

            console.log('invite_code', invite_code)
            if(!invite_code){
              return reject({ message: 'Invite code invalid.' });
            }
            //check token is valid
            const checkEndpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/api/invite-only/use-token` 
              const checkResponse = await axios.post(checkEndpoint, { token: invite_code }, {
                  headers: {
                    'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
                  }
                });

            console.log(checkResponse)
            return reject({message:'code rejected'})
            //@todo, if token is valid, mark it used!
            
            // const useEndpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/api/invite-only/use-token` 
            //   const response = await axios.post(endpoint, { userId: selectedUser?.id,quantity:inviteCount }, {
            //       headers: {
            //         'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
            //       }
            //     });
            //end prototypr mod
            /**
             * invite only done
             */

            // Create the new user.
            const params = {
              ...profile,
              email, // overwrite with lowercased email
              provider,
              role: defaultRole.id,
              confirmed: true,
            };

            const createdUser = await strapi
              .query('plugin::users-permissions.user')
              .create({ data: params });

            return resolve(createdUser);
          } catch (err) {
            reject(err);
          }
        })
        .catch(reject);
    });
  };

  const buildRedirectUri = (provider = '') => {
    const apiPrefix = strapi.config.get('api.rest.prefix');
    return urlJoin(getAbsoluteServerUrl(strapi.config), apiPrefix, 'connect', provider, 'callback');
  };

  return {
    connect,
    buildRedirectUri,
  };
};
