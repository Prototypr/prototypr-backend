"use strict";

const userValidation = require("../../../users-permissions/custom/resendConfirmationEmail/libs/userValidation");

module.exports = {
  createProduct: async (ctx) => {
    const { title, price, url, description } = ctx.request.body;
    const stripeProductResponse = await strapi
      .plugin("strapi-stripe")
      .service("stripeService")
      .createProduct(title, price, url, description);
    ctx.send(stripeProductResponse, 200);
  },
  async find(ctx) {
    const { offset, limit, sort, order } = ctx.params;
    let needToshort;
    if (sort === "name") {
      needToshort = { title: `${order}` };
    } else if (sort === "price") {
      needToshort = { price: `${order}` };
    }
    const count = await strapi
      .query("plugin::strapi-stripe.strapi-stripe-product")
      .count();

    const res = await strapi
      .query("plugin::strapi-stripe.strapi-stripe-product")
      .findMany({
        orderBy: needToshort,
        offset,
        limit,
        populate: true,
      });

    ctx.body = { res, count };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const res = await strapi
      .query("plugin::strapi-stripe.strapi-stripe-product")
      .findOne({ where: { id: id } });
    ctx.body = res;
  },
  updateProduct: async (ctx) => {
    const { id } = ctx.params;
    const { title, url, description, stripeProductId } = ctx.request.body;
    const updateProductResponse = await strapi
      .plugin("strapi-stripe")
      .service("stripeService")
      .updateProduct(id, title, url, description, stripeProductId);
    ctx.send(updateProductResponse, 200);
  },

  createCheckoutSession: async (ctx) => {
    //prototypr add - postId and postType + successUrl, sponsorWeeks
    const { stripePriceId, productId, productName, postId, postType, successUrl, cancelUrl, sponsorWeeks } = ctx.request.body;

    const checkoutSessionResponse = await strapi
      .plugin("strapi-stripe")
      .service("stripeService")
      //prototypr add -postId and postType + successUrl, sponsorWeeks
      .createCheckoutSession(stripePriceId, productId, productName, postId, postType, successUrl, cancelUrl, sponsorWeeks);
    ctx.send(checkoutSessionResponse, 200);
  },
  retrieveCheckoutSession: async (ctx) => {
    const { id } = ctx.params;
    const retrieveCheckoutSessionResponse = await strapi
      .plugin("strapi-stripe")
      .service("stripeService")
      .retrieveCheckoutSession(id);

    ctx.send(retrieveCheckoutSessionResponse, 200);
  },
  savePayment: async (ctx) => {
    const {
      txnDate,
      transactionId,
      isTxnSuccessful,
      txnMessage,
      txnAmount,
      customerName,
      customerEmail,
      stripeProduct,
      userId,
      job,
      sponsoredPost
    } = ctx.request.body;

    /**
     * would be better to get the user id from
     * the jwt, but don't know how
     * 
     * it doesn't really matter either - who's going to want to change
     * the user id of a sponsorship?
     */

    const savePaymentDetails = await strapi
      .query("plugin::strapi-stripe.strapi-stripe-payment")
      .create({
        data: {
          txnDate: txnDate,
          user:userId,
          transactionId: transactionId,
          isTxnSuccessful: isTxnSuccessful,
          txnMessage: JSON.stringify(txnMessage),
          txnAmount: txnAmount,
          customerName: customerName,
          customerEmail: customerEmail,
          stripeProduct: stripeProduct,
          job:job,
          sponsoredPost:sponsoredPost
        },
        populate: true,
      });

    /**
     * prototypr addition - need to update product availability so it
     * can't be bought again.
     */
    console.log('update the product')
    console.log(stripeProduct)
    // if it's a sponsor, set it to unavailable
    // update: don't need to do this any more, as you can only
    // buy what's available, if there's a clash, fix it manually
    // make sure sponsor product is id = 1
    // if(isTxnSuccessful && (stripeProduct==1 || stripeProduct=='1')){
    //     await strapi.entityService.update('plugin::strapi-stripe.strapi-stripe-product', 
    //     stripeProduct, {
    //      data: {
    //        availability: false,
    //      },
    //    });
    // }


    return savePaymentDetails;
  },
  getProductPayments: async (ctx) => {
    const { id, sort, order, offset, limit } = ctx.params;
    let needToshort;
    if (sort === "name") {
      needToshort = { customerName: `${order}` };
    } else if (sort === "email") {
      needToshort = { customerEmail: `${order}` };
    } else if (sort === "date") {
      needToshort = { txnDate: `${order}` };
    }
    const count = await strapi
      .query("plugin::strapi-stripe.strapi-stripe-payment")
      .count({
        where: { stripeProduct: id },
      });

    const payments = await strapi
      .query("plugin::strapi-stripe.strapi-stripe-payment")
      .findMany({
        where: { stripeProduct: id },
        orderBy: needToshort,
        offset,
        limit,
        populate: true,
      });
    return { payments, count };
  },
};