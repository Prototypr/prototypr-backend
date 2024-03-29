window.onload = () => {
    // for product Checkout
    const ssProduct = document.getElementById("SS_ProductCheckout");
    if (ssProduct) {
      ssProduct.addEventListener("click", () => {
        SS_ProductCheckout();
      });
    }
  
    // for storing product payment order in strapi
    const params = new URLSearchParams(document.location.search);
    const checkoutSessionId = params.get("sessionId");
    if (checkoutSessionId) {
      SS_GetProductPaymentDetails(checkoutSessionId);
    }
  };
  
  // product Checkout logic
  
  function SS_ProductCheckout() {
    const strapiStripe = document.querySelector("#SS_ProductCheckout");
    const productId = strapiStripe.dataset.id;
    // console.log(typeof productId);
    const baseUrl = strapiStripe.dataset.url;
    localStorage.setItem("strapiStripeUrl", baseUrl);
    const getProductApi = baseUrl + "/strapi-stripe/getProduct/" + productId;
    const checkoutSessionUrl = baseUrl + "/strapi-stripe/createCheckoutSession/";
    // console.log(getProductApi, checkoutSessionUrl);
    fetch(getProductApi, {
      method: "get",
      mode: "cors",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetch(checkoutSessionUrl, {
          method: "post",
          body: JSON.stringify({
            stripePriceId: response.stripePriceId,
            productId: response.id,
            productName: response.title,
          }),
          mode: "cors",
          headers: new Headers({
            "Content-Type": "application/json",
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.id) {
              window.location.replace(response.url);
            }
          });
      });
  }
  
  //  storing product payment order in strapi logic
  
  function SS_GetProductPaymentDetails(checkoutSessionId) {
    const baseUrl = localStorage.getItem("strapiStripeUrl");
    const retrieveCheckoutSessionUrl =
      baseUrl + "/strapi-stripe/retrieveCheckoutSession/" + checkoutSessionId;
    fetch(retrieveCheckoutSessionUrl, {
      method: "get",
      mode: "cors",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.payment_status === "paid") {
          if (
            window.performance
              .getEntriesByType("navigation")
              .map((nav) => nav.type)
              .includes("reload")
          ) {
            console.info("website reloded");
          } else {
            //update product to say it's sold (prototypr custom)
            // not allowed 405 - need to do it from a webhook
            // const stripeUpdateProductUrl = baseUrl + "/strapi-stripe/updateProduct";
            // fetch(stripeUpdateProductUrl, {
            //   method: "post",
            //   body: JSON.stringify({
            //     available: false,
            //   }),
            //   mode: "cors",
            //   headers: new Headers({
            //     "Content-Type": "application/json",
            //   }),
            // });
  
            // store payment in strapi
            const stripePaymentUrl = baseUrl + "/strapi-stripe/stripePayment";
            fetch(stripePaymentUrl, {
              method: "post",
              body: JSON.stringify({
                txnDate: new Date(),
                transactionId: response.id,
                isTxnSuccessful: true,
                // txnMessage: response,
                txnAmount: response.amount_total / 100,
                customerName: response.customer_details.name,
                customerEmail: response.customer_details.email,
                stripeProduct: response.metadata.productId,
              }),
              mode: "cors",
              headers: new Headers({
                "Content-Type": "application/json",
              }),
            });
          }
        }
      });
  }
  