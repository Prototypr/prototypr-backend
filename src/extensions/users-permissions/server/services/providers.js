'use strict';

/**
 * Module dependencies.
 */

// Public node modules.
const _ = require('lodash');
const urlJoin = require('url-join');
const axios = require("axios");//prototypr
require('dotenv').config();//prototypr

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

            //check if token is the secret code
            let secretPasscodeValid = false
            const pluginStore = strapi.store({
              environment: strapi.config.environment,
              type: "plugin",
              name: "invite-only",
            });

            const pass= await pluginStore.get({ key: "secretPasscodeConfig" })
            if(invite_code === pass?.secretPasscode){
              secretPasscodeValid = true
            }

            if(!invite_code){
              return reject({ message: 'Invite code invalid.' });
            }
            
            //check token is valid
            const checkEndpoint = `${process.env.STRAPI_URL}/api/invite-only/check-token` 
            const checkResponse = await axios.post(checkEndpoint, { token: invite_code }, {headers: {'Content-Type': 'application/json'}});
            //if token invalid
            if((!(checkResponse?.data?.valid==true && checkResponse?.data?.token?.used==false)) && secretPasscodeValid==false){
              return reject({message:'Invite code rejected'})
            }

            // Create the new user.
            const params = {
              ...profile,
              email, // overwrite with lowercased email
              provider,
              role: defaultRole.id,
              confirmed: true,
              invite_code:checkResponse?.data?.token?.id? checkResponse?.data?.token?.id:null//prototypr invite code
            };

            const createdUser = await strapi
              .query('plugin::users-permissions.user')
              .create({ data: params });

            if(!secretPasscodeValid){
              //finally update prototypr invite code to used
              const updatedToken = await strapi.entityService.update('plugin::invite-only.invite-code', checkResponse?.data?.token?.id, {
                data: {
                  used: true,
                },
              });
            }

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
