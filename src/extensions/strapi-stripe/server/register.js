"use strict";

const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash");

const staticFileMiddleware = require("../../../plugins/strapi-stripe/server/middlewares/staticFiles");
module.exports = async ({ strapi }) => {
  // registeration phase
  await staticFileMiddleware({ strapi });
//   don't generate the JS, we keep it in the repo, and have it customised
// regenerating each time will overwrite prototypr customisations 
//   await generateJs();
};

async function generateJs() {
  const jsData = fs.readFileSync(
    path.resolve(__dirname, "public", "stripe.js"),
    "utf8"
  );
  const filledJsData = _.template(jsData)({
    backendUrl: strapi.config.server.url,
  });

  const bbbJsPath = path.resolve(
    strapi.dirs.extensions,
    "strapi-stripe",
    "public",
    "stripe.js"
  );
  await fs.ensureFile(bbbJsPath);
  await fs.writeFile(bbbJsPath, filledJsData);
}