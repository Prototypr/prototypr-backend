module.exports = ({ env }) => ({
     // enable a custom plugin
  'strapi-tiptap-editor': {
    // my-plugin is going to be the internal name used for this plugin
    resolve: './src/plugins/strapi-tiptap-editor',
    enabled: true,
    config: {
      // user plugin config goes here
    },
  },
  'passwordless': {
    // my-plugin is going to be the internal name used for this plugin
    enabled: true,
    resolve: './src/plugins/strapi-plugin-passwordless',
    config: {
      // user plugin config goes here
    },
  },
  meilisearch: {
    config: {
      post: {
        transformEntry({ entry }) { 
          // remove sensitive user info
          if(entry?.user){
            entry.user = {
              firstName:entry?.user?.firstName,
              secondName:entry?.user?.secondName,
              username:entry?.user?.username,
            }
          }
          return {
            ...entry
          }
        },
      }
    }
  },
    email: {
      config: {
        provider: 'mailgun',
        providerOptions: {
          apiKey: env('MAILGUN_API_KEY'),
          domain: env('MAILGUN_DOMAIN'), //Required if you have an account with multiple domains
          host: env('MAILGUN_HOST', 'api.mailgun.net'), //Optional. If domain region is Europe use 'api.eu.mailgun.net'
        },
        settings: {
          defaultFrom: 'hello@prototypr.io',
          defaultReplyTo: 'hello@prototypr.io',
        },
      },
    },
    sentry: {
      enabled: true,
      config: {
        dsn: env('SENTRY_DSN'),
        sendMetadata: true,
      },
    },
    // ...
    upload: {
      config: {
        provider: "strapi-provider-upload-dos",
        providerOptions: {
          key: process.env.DO_SPACE_ACCESS_KEY,
          secret: process.env.DO_SPACE_SECRET_KEY,
          endpoint: process.env.DO_SPACE_ENDPOINT,
          space: process.env.DO_SPACE_BUCKET,
          directory: process.env.DO_SPACE_DIRECTORY,
          cdn: process.env.DO_SPACE_CDN,
        },
      },
    },
  });