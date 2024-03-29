// module.exports = [
//   'strapi::errors',
//   'strapi::security',
//   'strapi::cors',
//   'strapi::poweredBy',
//   'strapi::logger',
//   'strapi::query',
//   'strapi::body',
//   'strapi::session',
//   'strapi::favicon',
//   'strapi::public',
// ];
// https://www.npmjs.com/package/strapi-provider-upload-dos
module.exports = [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "frame-src": [
            "'self'",
            "share.protopie.io",
            "youtube.com",
            "www.youtube.com",
            "codesandbox.io",
            "codepen.io",
            "upscri.be/",
            "letter-so.s3.amazonaws.com",
            "platform.twitter.com",
          ],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https://prototypr-media.sfo2.digitaloceanspaces.com",
            "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi",
            "http://prototyprio.gumlet.io",
            "https://sfo2.digitaloceanspaces.com",
            "wp.prototypr.io",
            "miro.medium.com",
            "letter-so.s3.amazonaws.com",
            "*"
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "https://prototypr-media.sfo2.digitaloceanspaces.com",
            "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi",
            "http://prototyprio.gumlet.io",
            "https://sfo2.digitaloceanspaces.com",
            "wp.prototypr.io",
            "miro.medium.com",
            "letter-so.s3.amazonaws.com",
            "youtube.com",
            "www.youtube.com",
            "cdn-images-1.medium.com"
          ],
          "script-src": [
            "'self'",
            "analytics.strapi.io",
            "platform.twitter.com",
            "https://platform.twitter.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      headers: "*",
      origin: [
        "http://localhost:8000",
        "http://localhost:3000",
        "http://localhost:1337",
        "https://sfo2.digitaloceanspaces.com",
        process.env.NEXT_URL,
        "https://analytics.strapi.io",
        process.env.STRAPI_URL,
      ],
    },
  },
  // "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  // "strapi::body",
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '20mb',
    },
  },
  "strapi::favicon",
  "strapi::public",
];
