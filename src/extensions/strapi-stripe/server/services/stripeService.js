"use strict";

const Stripe = require("stripe");

module.exports = ({ strapi }) => ({
  async createProduct(title, productPrice, url, description) {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: "plugin",
      name: "strapi-stripe",
    });
    const stripeSettings = await pluginStore.get({ key: "stripeSetting" });
    let stripe;
    if (stripeSettings.isLiveMode) {
      stripe = new Stripe(stripeSettings.stripeLiveSecKey);
    } else {
      stripe = new Stripe(stripeSettings.stripeTestSecKey);
    }

    const product = await stripe.products.create({
      name: title,
      description: description,
      images: [url],
    });
    const price = await stripe.prices.create({
      unit_amount: productPrice * 100,
      currency: stripeSettings.currency,
      product: product.id,
    });
    const create = await strapi
      .query("plugin::strapi-stripe.strapi-stripe-product")
      .create({
        data: {
          title,
          description,
          price: productPrice,
          currency: stripeSettings.currency,
          productImage: url,
          stripeProductId: product.id,
          stripePriceId: price.id,
        },
        populate: true,
      });

    return create;
  },
  async updateProduct(id, title, url, description, stripeProductId) {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: "plugin",
      name: "strapi-stripe",
    });
    const stripeSettings = await pluginStore.get({ key: "stripeSetting" });
    let stripe;
    if (stripeSettings.isLiveMode) {
      stripe = new Stripe(stripeSettings.stripeLiveSecKey);
    } else {
      stripe = new Stripe(stripeSettings.stripeTestSecKey);
    }

    await stripe.products.update(stripeProductId, {
      name: title,
      description: description,
      images: [url],
    });
    const updateProductResponse = await strapi
      .query("plugin::strapi-stripe.strapi-stripe-product")
      .update({
        where: { id: id },
        data: {
          title,
          description,
          productImage: url,
        },
      });
    return updateProductResponse;
  },
  //prototypr changes - add postId, postType, successUrl, sponsorWeeks
  async createCheckoutSession(stripePriceId, productId, productName, postId,postType, successUrl, cancelUrl, sponsorWeeks) {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: "plugin",
      name: "strapi-stripe",
    });
    const stripeSettings = await pluginStore.get({ key: "stripeSetting" });
    let stripe;
    if (stripeSettings.isLiveMode) {
      stripe = new Stripe(stripeSettings.stripeLiveSecKey);
    } else {
      stripe = new Stripe(stripeSettings.stripeTestSecKey);
    }
    //prototypr change for multibuy
    let quantity = 1
    if(sponsorWeeks?.length){
      quantity = sponsorWeeks.length
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: stripePriceId,
          quantity: quantity,//prototypr
        },
      ],
      mode: "payment",
      success_url: `${successUrl?successUrl:stripeSettings.checkoutSuccessUrl}?sessionId={CHECKOUT_SESSION_ID}`,//prototypr
      cancel_url: `${cancelUrl?cancelUrl:stripeSettings.checkoutCancelUrl}`,
      metadata: {
        productId: `${productId}`,
        productName: `${productName}`,
        postId:`${postId}`,//prototypr
        postType:`${postType}`,//prototypr,
        sponsorWeeks:`${sponsorWeeks}`
      },
    });
    return session;
  },
  async retrieveCheckoutSession(checkoutSessionId) {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: "plugin",
      name: "strapi-stripe",
    });
    const stripeSettings = await pluginStore.get({ key: "stripeSetting" });
    let stripe;
    if (stripeSettings.isLiveMode) {
      stripe = new Stripe(stripeSettings.stripeLiveSecKey);
    } else {
      stripe = new Stripe(stripeSettings.stripeTestSecKey);
    }
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    return session;
  },
});
