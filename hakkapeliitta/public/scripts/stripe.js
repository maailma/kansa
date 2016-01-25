/*
Some pointers for sending additional values to the backend
http://stackoverflow.com/questions/22546050/stripe-checkout-custom-button-not-charging
*/

// global variable for relaying information
var purchase = {
    type: null, upgrade: null, inclPaper: false,
    currency: null, amount: null, description: null,
    details: {}
};

/* Debugging for now */
function cbSuccess(data) {
    console.log("Received cbSuccess", data);
    alertify.success('Payment processing completed successfully!');
}

function cbError(data) {
    console.log("Received cbError", data);
    alertify.error('Payment processing failed!');
    //do some stuff
}

function cbComplete(data) {
    //console.log("Received cbComplete", data);
}

// Stripe handler
var handler = StripeCheckout.configure({
    key: 'pk_test_LoOP8RB3gIlLkSYIyM9G6skn',
    image: 'https://shop.worldcon.fi/assets/images/icons/android-icon-192x192.png',
    locale: 'auto',
    name: 'Worldcon 75',
    zipCode: true,
    token: function(token) {
        // Send the data to our processing backend
        $.ajax({
            url: "https://shop.worldcon.fi/orderMembership",
            type: "POST",
            data: JSON.stringify({tokenId : token.id,
                                  email: token.email,
                                  productId: "nonesuch",
                                  amount: purchase.amount,
                                  descr: purchase.description
                                }),
            contentType: "application/json",
            success: cbSuccess,
            error: cbError,
            complete: cbComplete
        });
    }
});

function checkPurchaseFields() {
    switch (purchase.type) {
        case 'adult':
        case 'youth':
            if (typeof purchase.upgrade != 'boolean') return { false: ['#upgrade'] };
            break;
        case 'support':
        case 'child':
            break;
        default:
            return { false: ['#type'] };
    }
    var res = { true: [], false: [] };
    res[!!$('#name').val()].push('#name');
    res[/.+@.+\..+/.test($('#email').val())].push('#email');
    if (purchase.inclPaper) $('#paper-details input, #paper-details textarea').each(function() {
        res[!!$(this).val()].push('#' + this.id);
    });
    return res;
}

function prettyAmount(currency, amount) {
    var cSymbol;
    switch (currency) {
        case 'eur': cSymbol = '€'; break;
        case 'usd': cSymbol = '$'; break;
        default: cSymbol = currency.toUpperCase() + ' ';
    }
    return cSymbol + (purchase.amount / 100).toString();
}

function setPurchaseAmountAndDescription() {
    var base = memberships[purchase.type];
    if (!base) {
        purchase.currency = null;
        purchase.amount = null;
        purchase.description = null;
        $('#stripe-checkout').html('');
        return false;
    }
    purchase.currency = base.currency;
    purchase.amount = base.amount;
    purchase.description = base.description;
    if (purchase.upgrade) {
        var prev = memberships.support
        if (!prev || !prev.amount || prev.currency !== purchase.currency) throw new Error('Membership data is corrupt!');
        purchase.amount -= prev.amount;
        purchase.description += ' (Upgrade)';
    }
    if (purchase.inclPaper) {
        var paper = memberships.paperPubs;
        if (!paper || !paper.amount || paper.currency !== purchase.currency) throw new Error('Membership data is corrupt!');
        purchase.amount += paper.amount;
        purchase.description += ' + ' + paper.description;
    }
    if (purchase.amount < 0) throw new Error('Purchases are supposed to cost positive money.');
    purchase.description += ' (' + prettyAmount(purchase.currency, purchase.amount) + ')';
    $('#stripe-checkout').html(purchase.description);
    return true;
}

function setPurchaseDetails() {
    purchase.details = {};
    var fields = checkPurchaseFields();
    if (fields.false.length) throw new Error('Invalid purchase fields remain! ' + fields.false.join(', '));
    $('#details input, #details textarea').each(function() {
        purchase.details[this.id] = $(this).val();
    });
}

function markValidDetails(ev) {
    var fields = checkPurchaseFields();
    if (fields.false.length) {
        var title = 'Invalid fields: ' + fields.false.join(', ').replace(/#/g, '');
        $('#stripe-checkout').prop('disabled', true).prop('title', title);
    } else {
        $('#stripe-checkout').prop('disabled', false).prop('title', '');
    }
    $('.has-error').removeClass('has-error');
    $('.has-success').removeClass('has-success');
    $('.glyphicon').removeClass('glyphicon-ok glyphicon-remove');
    var focusIdx = ev.target.tabIndex;
    if (focusIdx <= 0) focusIdx = 999;
    else if (ev.type === 'blur') ++focusIdx;
    $(fields.false.join(',')).each(function() {
        if (this.tabIndex < focusIdx) {
            $(this).next().addClass('glyphicon-remove').parent().addClass('has-error');
        }
    });
    $(fields.true.join(',')).each(function() {
        if (this.tabIndex < focusIdx) {
            $(this).next().addClass('glyphicon-ok').parent().addClass('has-success');
        }
    });
}

function scrollTo(sel) {
    $('html, body').animate({ scrollTop: $(sel).offset().top - 20 }, 1000);
}

// Set button texts
$(function () {
    $('#type input').on('click', function() {
        $('#type input').removeClass('active btn-primary').addClass('btn-default');
        $(this).addClass('active btn-primary').removeClass('btn-default');
        purchase.type = this.id.split('-', 1)[0];
        purchase.upgrade = null;
        setPurchaseAmountAndDescription();
        switch (this.id) {
            case 'adult-btn':
            case 'youth-btn':
                $('#upgrade').show();
                $('#details').hide();
                var prevUpgrade = $('#upgrade .active');
                if (prevUpgrade.length) prevUpgrade.click();
                else {
                    scrollTo('#upgrade');
                    $('#upgrade-btn').focus();
                }
                break;
            case 'support-btn':
            case 'child-btn':
                $('#upgrade').hide();
                $('#details').show();
                scrollTo('#details');
                $('#name').focus();
                break;
            default:
                $('#upgrade').hide();
                $('#details').hide();
                throw new Error('Unexpected #type id ' + JSON.stringify(this.id));
        }
    });

    $('#upgrade input').on('click', function() {
        $('#upgrade input').removeClass('active btn-primary').addClass('btn-default');
        $(this).addClass('active btn-primary').removeClass('btn-default');
        switch (this.id) {
            case 'upgrade-btn': purchase.upgrade = true; break;
            case 'new-btn':     purchase.upgrade = false; break;
            default: throw new Error('Unexpected #upgrade id ' + JSON.stringify(this.id));
        }
        setPurchaseAmountAndDescription();
        $('#details').show();
        scrollTo('#details');
        $('#name').focus();
    });

    $('#paper-pubs').on('change', function() {
        purchase.inclPaper = this.checked;
        setPurchaseAmountAndDescription();
        $('#paper-details').toggle(purchase.inclPaper);
    });

    $('#details input, #details textarea').on('input change focus blur', markValidDetails);

    $('#stripe-checkout').on('click', function() {
        setPurchaseDetails();
        console.log("Let's make a purchase!", purchase);
        handler.open({
            currency: purchase.currency,
            description: purchase.description,
            amount: purchase.amount,
            email: purchase.details.email
        });
    });
});

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
