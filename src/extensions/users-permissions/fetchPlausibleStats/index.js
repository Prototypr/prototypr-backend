/**
 * Update a/an user record.
 * https://strapi.io/video-library/update-own-user-data
 *
 * @return {Object}
 */
const fs = require("fs");

const _ = require("lodash");
const utils = require("@strapi/utils");
// const { getService } = require("./libs/getService");
// const { validateUpdateUserBody } = require("./libs/userValidation");

const { sanitize } = utils;

const axios = require("axios");

const plausibleKey =
  "XjrEoqLmHJhq6A1KLybxBHD2bM6ou1ZYK1REKk7h9tjDc4wZ3aqXwPaWVROE8dk_";

const baseURL = "https://analytics.prototypr.io/api/v1";

const fetchPlausibleData = async (slug, metrics = ["pageviews"]) => {
  const metricsString = metrics.join(",");
  // visits,bounce_rate,visit_duration,pageviews
  const apiEndpoint = `${baseURL}/stats/aggregate`;

  const siteId = "4.prototypr.io";
  const todayDate = new Date().toISOString().slice(0, 10);

  const plausibleRequest = `${apiEndpoint}?site_id=${siteId}&filters=event:page%3D%3D%2Fpost/${slug}&metrics=${metricsString}&period=custom&date=2021-01-01,${todayDate}`;

  let configUpload = {
    method: "get",
    url: plausibleRequest,
    headers: {
      Authorization: `Bearer ${plausibleKey}`,
    },
    data: {},
  };

  const response = await axios(configUpload).catch(function (error) {
    console.log(error);
  });

  return response.data.results;
};

// fetch time series data
const fetchTimeSeriesData = async (slug, metrics = ["pageviews"]) => {
  const metricsString = metrics.join(",");
  const apiEndpoint = `${baseURL}/stats/timeseries`;
  const siteId = "4.prototypr.io";

  // https://analytics.prototypr.io/api/v1/stats/timeseries?site_id=4.prototypr.io&metrics=visits,bounce_rate,visit_duration,pageviews&period=30d&filters=event:page%3D%3D%2Fpost/are-ui-ux-tips-the-new-clickbait-for-designerse29ca8
  const plausibleRequest = `${apiEndpoint}?site_id=${siteId}&metrics=${metricsString}&period=30d&filters=event:page%3D%3D%2Fpost/${slug}`;

  let configUpload = {
    method: "get",
    url: plausibleRequest,
    headers: {
      Authorization: `Bearer ${plausibleKey}`,
    },
  };

  const response = await axios(configUpload).catch(function (error) {
    console.log(error);
  });

  return response.data.results;
};

module.exports = {
  /**
   * delete avatar
   * @param {*} ctx
   */

  async fetchPlausibleStatsForUser(ctx) {
    const { id, slug } = ctx.request.body;

    /**
     * required: userId and post slug. [x]
     * Fetch user
     * Fetch plausible stats for slug
     * check if user has slug in their posts
     * if slug exists then show plausible data
     * if not, then access denied.
     *
     */

    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      id,
      { populate: ["posts"] }
    );

    if (user) {
      const { posts: userPosts } = user;
      const slugExistsInPost = userPosts.find((post) => post.slug === slug);
      console.log("slugExits -", slugExistsInPost);
      if (slugExistsInPost) {
        const s = slug; // "take-me-to-the-useless-webs";
        // fetch plausible data
        const monthlyAggregate = await fetchPlausibleData(s, [
          "visits",
          "bounce_rate",
          "visit_duration",
          "pageviews",
        ]);

        const timeSeries = await fetchTimeSeriesData(s, [
          "visits",
          "bounce_rate",
          "visit_duration",
          "pageviews",
        ]);

        const plausibleData = {
          timeSeries,
          monthlyAggregate,
        };
        ctx.send({ status: 200, msg: "Access Granted!", plausibleData });
      } else {
        ctx.send({ status: 401, msg: "Access Denied!" });
      }
    } else {
      console.log("user not found");
      ctx.send({ status: 401, msg: "Access Denied!" });
    }

    console.log("fetching stats for user");

    // ctx.send({ status: true });
  },
};
