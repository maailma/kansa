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
function cbBeforeSend() {
    var processingMssage = 'Card details verified. Please wait while we process the payment'
    // Show alert and dim background
    var hpos = ($(window).width() / 2) - 300;
    var vpos = ($(window).height() / 2) - 94;
    alertify.alert(processingMssage).set({'label': null,
                                          'modal': true, 
                                          'closable': false, 
                                          'closableByDimmer': false,
                                          'basic': true,
                                          'movable': false,
                                        //  'transition': 'fade'
                                        }).moveTo(hpos,vpos); 
    /*
    //get the closable setting value.
    var stripeAlert = alertify.alert().setting('closable');
    //grab the dialog instance using its parameter-less constructor then set multiple settings at once.
    alertify.alert()
        .setting({
            'label': null,
            'modal', true,
            'closable', false,
            'closableByDimmer': false,
            'basic': true,
            'movable': false
            'message': 'Please wait while we process the payment'
        }).moveTo(hpos,vpos).show();
    */
}

function cbTimeout() {
    if (alertify.alert().isOpen()) alertify.alert().close();
    alertify.alert('Please check your connectivity.').setHeader('<em>Payment processing timed out!</em> ');
}

function cbSuccess(data) {
    console.log("Received cbSuccess", data);

    var amount = data.amount/100
    var date = new Date(data.created*1000);
    var retMessage  = 'Description: ' + data.description + '<br>';
        retMessage += 'Amount: ' + amount + ' ' + data.currency + '<br>';
        retMessage += 'Transaction ID: ' + data.id + '<br>';
        retMessage += 'Transaction Time: ' + date + '<br>';

    var hpos = ($(window).width() / 2) - 300;
    var vpos = ($(window).height() / 2) - 94;
    alertify.alert(retMessage).set({'label': 'Close',
                                    'modal': true, 
                                    'closable': true, 
                                    'closableByDimmer': false,
                                    'basic': false,
                                    'movable': false,
                                //    'transition': 'fade',
                                    'onok': function(){ location.replace("//www.worldcon.fi");}
                                    }).setHeader('<em>Payment processing completed successfully!</em> ')
                                      .moveTo(hpos,vpos); 
}

function cbError(data) {
    console.log("Received cbError", data);

    var errMessage  = 'Status : ' + data.responseJSON.status + '<br>'; 
        errMessage += 'Message: ' + data.responseJSON.message; 

    var hpos = ($(window).width() / 2) - 300;
    var vpos = ($(window).height() / 2) - 94;
    alertify.alert(errMessage).set({'label': 'Close',
                                    'modal': true, 
                                    'closable': true, 
                                    'closableByDimmer': false,
                                    'basic': false,
                                    'movable': false,
                                //    'transition': 'fade',
                                    }).setHeader('<em>Payment processing error!</em> ')
                                      .moveTo(hpos,vpos);
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
        $.ajax({
            url: "https://shop.worldcon.fi/orderMembership",
            type: "POST",
            data: JSON.stringify({ token: token, purchase: purchase }),
            contentType: "application/json",
            beforeSend: cbBeforeSend,
            timeout: cbTimeout,
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

function myScrollTo(scrollTo, focus) {
    $('html, body').animate({ scrollTop: $(scrollTo).offset().top - 20 }, 1000,
                            function() { $(focus).focus(); });
}

// Set button texts
$(function () {
    $('#type input').on('click', function() {
        $('#type input').removeClass('active btn-primary').addClass('btn-default');
        $(this).addClass('active btn-primary').removeClass('btn-default');
        purchase.type = this.id.split('-', 1)[0];
        purchase.upgrade = null;
        setPurchaseAmountAndDescription();
        $('.no-kids').show();
        switch (this.id) {
            case 'adult-btn':
            case 'youth-btn':
                $('#upgrade').show();
                $('#details').hide();
                var prevUpgrade = $('#upgrade .active');
                if (prevUpgrade.length) prevUpgrade.click();
                else myScrollTo('#upgrade', '#upgrade-btn');
                break;
            case 'child-btn':
                $('.no-kids').hide();
                // fallthrough
            case 'support-btn':
                $('#upgrade').hide();
                $('#details').show();
                myScrollTo('#details', '#name')
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
        myScrollTo('#details', '#name')
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
        var desc = purchase.description
                       .replace('membership', 'member')
                       .replace('publications', 'pubs')
                       .replace(/ \([^)]*\d+\)$/, '');
        handler.open({
            currency: purchase.currency,
            description: desc,
            amount: purchase.amount,
            email: purchase.details.email
        });
    });
});

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
