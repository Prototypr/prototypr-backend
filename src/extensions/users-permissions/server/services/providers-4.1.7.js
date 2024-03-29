'use strict';

/**
 * Module dependencies.
 */

// Public node modules.
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const urlJoin = require('url-join');

const { getAbsoluteServerUrl } = require('@strapi/utils');

module.exports = ({ strapi }) => {
  // lazy load heavy dependencies
  const request = require('request');
  // Purest strategies.
  const purest = require('purest')({ request });
  const purestConfig = require('@purest/providers');

  /**
   * Helper to get profiles
   *
   * @param {String}   provider
   * @param {Function} callback
   */

  const getProfile = async (provider, query, callback) => {
    const access_token = query.access_token || query.code || query.oauth_token;

    const providers = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'grant' })
      .get();

    switch (provider) {
      case 'discord': {
        const discord = purest({
          provider: 'discord',
          config: {
            discord: {
              'https://discordapp.com/api/': {
                __domain: {
                  auth: {
                    auth: { bearer: '[0]' },
                  },
                },
                '{endpoint}': {
                  __path: {
                    alias: '__default',
                  },
                },
              },
            },
          },
        });
        discord
          .query()
          .get('users/@me')
          .auth(access_token)
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              // Combine username and discriminator because discord username is not unique
              var username = `${body.username}#${body.discriminator}`;
              callback(null, {
                username,
                email: body.email,
              });
            }
          });
        break;
      }
      case 'cognito': {
        // get the id_token
        const idToken = query.id_token;
        // decode the jwt token
        const tokenPayload = jwt.decode(idToken);
        if (!tokenPayload) {
          callback(new Error('unable to decode jwt token'));
        } else {
          callback(null, {
            username: tokenPayload['cognito:username'],
            email: tokenPayload.email,
          });
        }
        break;
      }
      case 'facebook': {
        const facebook = purest({
          provider: 'facebook',
          config: purestConfig,
        });

        facebook
          .query()
          .get('me?fields=name,email')
          .auth(access_token)
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                username: body.name,
                email: body.email,
              });
            }
          });
        break;
      }
      case 'google': {
        const google = purest({ provider: 'google', config: purestConfig });

        google
          .query('oauth')
          .get('tokeninfo')
          .qs({ access_token })
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                username: body.email.split('@')[0],
                email: body.email,
              });
            }
          });
        break;
      }
      case 'github': {
        const github = purest({
          provider: 'github',
          config: purestConfig,
          defaults: {
            headers: {
              'user-agent': 'strapi',
            },
          },
        });

        github
          .query()
          .get('user')
          .auth(access_token)
          .request((err, res, userbody) => {
            if (err) {
              return callback(err);
            }

            // This is the public email on the github profile
            if (userbody.email) {
              return callback(null, {
                username: userbody.login,
                email: userbody.email,
              });
            }

            // Get the email with Github's user/emails API
            github
              .query()
              .get('user/emails')
              .auth(access_token)
              .request((err, res, emailsbody) => {
                if (err) {
                  return callback(err);
                }

                return callback(null, {
                  username: userbody.login,
                  email: Array.isArray(emailsbody)
                    ? emailsbody.find(email => email.primary === true).email
                    : null,
                });
              });
          });
        break;
      }
      case 'microsoft': {
        const microsoft = purest({
          provider: 'microsoft',
          config: purestConfig,
        });

        microsoft
          .query()
          .get('me')
          .auth(access_token)
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                username: body.userPrincipalName,
                email: body.userPrincipalName,
              });
            }
          });
        break;
      }
      case 'twitter': {
        const twitter = purest({
          provider: 'twitter',
          config: purestConfig,
          key: providers.twitter.key,
          secret: providers.twitter.secret,
        });

        twitter
          .query()
          .get('account/verify_credentials')
          .auth(access_token, query.access_secret)
          .qs({ screen_name: query['raw[screen_name]'], include_email: 'true' })
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                username: body.screen_name,
                email: body.email,
                image:body.profile_image_url_https//prototypr change - add image
              });
            }
          });
        break;
      }
      case 'instagram': {
        const instagram = purest({
          provider: 'instagram',
          key: providers.instagram.key,
          secret: providers.instagram.secret,
          config: purestConfig,
        });

        instagram
          .query()
          .get('me')
          .qs({ access_token, fields: 'id,username' })
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                username: body.username,
                email: `${body.username}@strapi.io`, // dummy email as Instagram does not provide user email
              });
            }
          });
        break;
      }
      case 'vk': {
        const vk = purest({
          provider: 'vk',
          config: purestConfig,
        });

        vk.query()
          .get('users.get')
          .qs({ access_token, id: query.raw.user_id, v: '5.122' })
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                username: `${body.response[0].last_name} ${body.response[0].first_name}`,
                email: query.raw.email,
              });
            }
          });
        break;
      }
      case 'twitch': {
        const twitch = purest({
          provider: 'twitch',
          config: {
            twitch: {
              'https://api.twitch.tv': {
                __domain: {
                  auth: {
                    headers: {
                      Authorization: 'Bearer [0]',
                      'Client-ID': '[1]',
                    },
                  },
                },
                'helix/{endpoint}': {
                  __path: {
                    alias: '__default',
                  },
                },
                'oauth2/{endpoint}': {
                  __path: {
                    alias: 'oauth',
                  },
                },
              },
            },
          },
        });

        twitch
          .get('users')
          .auth(access_token, providers.twitch.key)
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                username: body.data[0].login,
                email: body.data[0].email,
              });
            }
          });
        break;
      }
      case 'linkedin': {
        const linkedIn = purest({
          provider: 'linkedin',
          config: {
            linkedin: {
              'https://api.linkedin.com': {
                __domain: {
                  auth: [{ auth: { bearer: '[0]' } }],
                },
                '[version]/{endpoint}': {
                  __path: {
                    alias: '__default',
                    version: 'v2',
                  },
                },
              },
            },
          },
        });
        try {
          const getDetailsRequest = () => {
            return new Promise((resolve, reject) => {
              linkedIn
                .query()
                .get('me')
                .auth(access_token)
                .request((err, res, body) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(body);
                });
            });
          };

          const getEmailRequest = () => {
            return new Promise((resolve, reject) => {
              linkedIn
                .query()
                .get('emailAddress?q=members&projection=(elements*(handle~))')
                .auth(access_token)
                .request((err, res, body) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(body);
                });
            });
          };

          const { localizedFirstName } = await getDetailsRequest();
          const { elements } = await getEmailRequest();
          const email = elements[0]['handle~'];

          callback(null, {
            username: localizedFirstName,
            email: email.emailAddress,
          });
        } catch (err) {
          callback(err);
        }
        break;
      }
      case 'reddit': {
        const reddit = purest({
          provider: 'reddit',
          config: purestConfig,
          defaults: {
            headers: {
              'user-agent': 'strapi',
            },
          },
        });

        reddit
          .query('auth')
          .get('me')
          .auth(access_token)
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                username: body.name,
                email: `${body.name}@strapi.io`, // dummy email as Reddit does not provide user email
              });
            }
          });
        break;
      }
      case 'auth0': {
        const purestAuth0Conf = {};
        purestAuth0Conf[`https://${providers.auth0.subdomain}.auth0.com`] = {
          __domain: {
            auth: {
              auth: { bearer: '[0]' },
            },
          },
          '{endpoint}': {
            __path: {
              alias: '__default',
            },
          },
        };
        const auth0 = purest({
          provider: 'auth0',
          config: {
            auth0: purestAuth0Conf,
          },
        });

        auth0
          .get('userinfo')
          .auth(access_token)
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              const username =
                body.username || body.nickname || body.name || body.email.split('@')[0];
              const email = body.email || `${username.replace(/\s+/g, '.')}@strapi.io`;

              callback(null, {
                username,
                email,
              });
            }
          });
        break;
      }
      case 'cas': {
        const provider_url = 'https://' + _.get(providers.cas, 'subdomain');
        const cas = purest({
          provider: 'cas',
          config: {
            cas: {
              [provider_url]: {
                __domain: {
                  auth: {
                    auth: { bearer: '[0]' },
                  },
                },
                '{endpoint}': {
                  __path: {
                    alias: '__default',
                  },
                },
              },
            },
          },
        });
        cas
          .query()
          .get('oidc/profile')
          .auth(access_token)
          .request((err, res, body) => {
            if (err) {
              callback(err);
            } else {
              // CAS attribute may be in body.attributes or "FLAT", depending on CAS config
              const username = body.attributes
                ? body.attributes.strapiusername || body.id || body.sub
                : body.strapiusername || body.id || body.sub;
              const email = body.attributes
                ? body.attributes.strapiemail || body.attributes.email
                : body.strapiemail || body.email;
              if (!username || !email) {
                strapi.log.warn(
                  'CAS Response Body did not contain required attributes: ' + JSON.stringify(body)
                );
              }
              callback(null, {
                username,
                email,
              });
            }
          });
        break;
      }
      default:
        callback(new Error('Unknown provider.'));
        break;
    }
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
        return reject([null, { message: 'No access_token.' }]);
      }

      // Get the profile.
      getProfile(provider, query, async (err, profile) => {
        if (err) {
          return reject([null, err]);
        }

        const email = _.toLower(profile.email);

        // We need at least the mail.
        if (!email) {
          return reject([null, { message: 'Email was not available.' }]);
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
            return resolve([
              null,
              [{ messages: [{ id: 'Auth.advanced.allow_register' }] }],
              'Register action is actually not available.',
            ]);
          }

          if (!_.isEmpty(user)) {
            return resolve([user, null]);
          }

          if (
            !_.isEmpty(_.find(users, user => user.provider !== provider)) &&
            advanced.unique_email
          ) {
            return resolve([
              null,
              [{ messages: [{ id: 'Auth.form.error.email.taken' }] }],
              'Email is already taken.',
            ]);
          }

          // Retrieve default role.
          const defaultRole = await strapi
            .query('plugin::users-permissions.role')
            .findOne({ where: { type: advanced.default_role } });

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

          return resolve([createdUser, null]);
        } catch (err) {
          reject([null, err]);
        }
      });
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