/*
Some pointers for sending additional values to the backend
http://stackoverflow.com/questions/22546050/stripe-checkout-custom-button-not-charging
*/

// global variable for relaying information
var currProduct = [];

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }
  return true;
}

function getProduct(myId) {
  for (var i = 0, len = memberships.length; i < len; i++) {
    if (memberships[i].id === myId)
      return memberships[i]; // Return as soon as the object is found
  }
  return null; // The object was not found
}

/* Debugging for now */
function cbSuccess(data) {
    console.log("Received cbSuccess:" + JSON.stringify(data));
    alertify.success('Payment processing completed successfully!');
}

function cbError(data) {
    console.log("Received cbError:" + JSON.stringify(data));
    alertify.error('Payment processing failed!');
    //do some stuff
}

function cbComplete(data) {
    console.log("Received cbComplete:" + JSON.stringify(data));
    /* alertify.success('Payment processing completed successfully!'); */
}

// Stripe handler
var handler = StripeCheckout.configure({
  key: 'pk_test_LoOP8RB3gIlLkSYIyM9G6skn',
  image: 'https://shop.worldcon.fi/assets/images/icons/android-icon-192x192.png',
  locale: 'auto',
  name: 'Worldcon 75',
  token: function(token) {
    // Send the data to our processing backend
    $.ajax({
        url: "https://shop.worldcon.fi/orderMembership",
        type: "POST",
        data: JSON.stringify({"tokenId" : token.id,
                              "email": token.email,
                              "productId": currProduct.id,
                              "amount": currProduct.price,
                              "descr": currProduct.descr
                            }),
        contentType: "application/json",
        success: cbSuccess,
        error: cbError,
        complete: cbComplete
    });
  }
});

// Set button texts
$(function () {
  $('button').each(function() {
    // console.log("Setting text for button ID: " + this.id);
    var product = getProduct(this.id);
    if (isEmpty(product)) {
      console.log("Product is empty for setting up the text. ID: " + this.id);
    } else {
      $("#" + this.id).html(product.buttonText);
    }
  }).on('click', function(e) {
    // Open Checkout with further options
    console.log("Clicked button with ID: " + this.id);
    e.preventDefault();

    // Extract the product based on its ID
    var product = getProduct(this.id);
    if (isEmpty(product)) {
      console.log("Product is empty after button click");
      return;
    }

    // set the current product values into the global variable for being sent to the server.
    currProduct = product;
    console.log(JSON.stringify(product, null, 2));
    handler.open({
      currency: "eur",
      description: product.descr,
      amount: product.price
    });
  });
});

// Close Checkout on page navigation
$(window).on('popstate', function() {
  handler.close();
});
