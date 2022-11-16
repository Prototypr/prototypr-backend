# Strapi Upload Provider for Digital Ocean Spaces
- This provider is a fork of  [shorwood/strapi-provider-upload-do](https://github.com/shorwood/strapi-provider-upload-do) for Digital Ocean spaces.

This provider will upload to the space using the AWS S3 API 

```diff
+ Compatible with version 4 of STRAPI (upgraded)
```
## Parameters
- **key** : [Space access key](https://cloud.digitalocean.com/account/api/tokens)
- **secret** : [Space access secret](https://cloud.digitalocean.com/account/api/tokens)
- **endpoint** : Base URL of the space (e.g. `fra.digitaloceanspaces.com`)
- **space** : Name of the space in the Digital Ocean panel.
- **directory** : Name of the sub-directory you want to store your files in. (Optionnal - e.g. `/example`)
- **cdn** : CDN Endpoint - URL of the cdn of the space (Optionnal - e.g. `cdn.example.com`)

## How to use

1. Install this package using npm or yarn

```
npm i strapi-provider-upload-dos
```

```
yarn add strapi-provider-upload-dos
```

2. Create config in `./config/plugins` with content (create if not exist (plugins.js))

```
module.exports = {
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
};

```

3. Create `.env` and add to them 

```
DO_SPACE_ACCESS_KEY
DO_SPACE_SECRET_KEY
DO_SPACE_ENDPOINT
DO_SPACE_BUCKET
DO_SPACE_DIRECTORY
DO_SPACE_CDN
```

with values obtained from tutorial:

> https://www.digitalocean.com/community/tutorials/how-to-create-a-digitalocean-space-and-api-key

Parameter `DO_SPACE_DIRECTORY` and `DO_SPACE_CDN` is optional and you can ommit them both in `.env` and `settings`.

## Modify the CSP roules and define the source


`config/middlewares.js`

```
module.exports = [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "*.digitaloceanspaces.com"
          ],
          "media-src": ["'self'", "data:", "blob:"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::favicon",
  "strapi::public",
];

```


## Resources

- [MIT License](LICENSE.md)

## Links

- [Strapi website](http://strapi.io/)
- [Strapi community on Discord](http://discord.strapi.io)
- [Strapi news on Twitter](https://twitter.com/strapijs)
- [Strapi docs about upload](https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html#open-source-contribution)


