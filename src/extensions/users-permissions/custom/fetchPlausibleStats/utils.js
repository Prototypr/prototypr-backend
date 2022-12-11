const _ = require("lodash");

const axios = require("axios");
const plausibleKey = process.env.PLAUSIBLE_KEY;
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
  fetchPlausibleData,
  fetchTimeSeriesData,
};
