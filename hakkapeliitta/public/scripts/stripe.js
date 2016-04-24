var purchase = {
    type: null, upgrade: null, firstCon: false, youth: false, inclPaper: false,
    currency: null, amount: null, description: null,
    details: {}
};

function prettyAlert(error, message) {
    return alertify
        .alert(message)
        .setHeader(error || '')
        .set({
            'modal': true,
            'transition': 'fade',
            'movable': false })
        .set(error ? {
            'label': 'Return to form',
            'closable': true,
            'closableByDimmer': false,
            'basic': false
        } : {
            'label': null,
            'closable': false,
            'closableByDimmer': false,
            'basic': true
        });
}

function stripeBeforeSend() {
    prettyAlert(null, 'Card details verified. Please wait while we process the payment...');
}

function stripeTimeout() {
    prettyAlert('Payment processing timed out!', 'Please check your connectivity.');
}

function stripeSuccess(data) {
    console.log('stripe success', data);
    prettyAlert(null, '<h3>Payment processing completed successfully</h3>\n' +
        '<p>The following confirmation has been sent to the email address you provided.' +
        '<span class="hidden-print">To purchase another membership, please reload this page.</span>\n<hr>\n' +
        '<div style="white-space:pre-wrap">' + data.message + '</div>');
    $('.container').addClass('hidden-print');
    $('#details input, #details textarea').val('');
    $('#first-con').prop('checked', false);
    $('#youth').prop('checked', false);
    $('#paper-pubs').prop('checked', false);
}

function stripeError(data) {
    console.log('stripe error', data);
    var msgLines = [
        'Status: ' + data.responseJSON.status,
        'Message: ' + data.responseJSON.message
    ];
    prettyAlert('Payment processing error!', msgLines.join('<br>\n'));
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
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
            beforeSend: stripeBeforeSend,
            timeout: stripeTimeout,
            success: stripeSuccess,
            error: stripeError
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

function prettyPrice(currency, amount, forceNonPositive) {
    var cSymbol;
    switch (currency) {
        case 'eur': cSymbol = '€'; break;
        case 'usd': cSymbol = '$'; break;
        default: cSymbol = currency.toUpperCase() + ' ';
    }
    if (amount < 0) cSymbol = '-' + cSymbol;
    else if (forceNonPositive) {
        return '±' + cSymbol + '0';
    }
    return cSymbol + (Math.abs(amount) / 100).toString();
}

function prettyPriceForType(type) {
    if (!type || !memberships) return '';
    var data = type.split('-').map(function(t) { return memberships[t] || {}; });
    var amount = data[0].amount;
    if (isNaN(parseFloat(amount)) || !isFinite(amount)) {
        console.warn('Membership price lookup error for ' + type + ': ' + amount);
        return '';
    }
    for (var i = 1; i < data.length; ++i) amount -= data[i].amount;
    return prettyPrice(data[0].currency, amount, data.length > 1);
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
    if (purchase.youth) {
        var youth = memberships.youth;
        if (!youth || !youth.amount || youth.currency !== purchase.currency) throw new Error('Membership data is corrupt!');
        purchase.amount = youth.amount;
        purchase.description = youth.description;
    } else if (purchase.firstCon) {
        var first = memberships.firstCon;
        if (!first || !first.amount || first.currency !== purchase.currency) throw new Error('Membership data is corrupt!');
        purchase.amount = first.amount;
        purchase.description = first.description;
    }
    if (purchase.upgrade) {
        var prev = memberships.support;
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
    var strPrice = prettyPrice(purchase.currency, purchase.amount);
    $('#stripe-checkout').html(purchase.description + ' (' + strPrice + ')');
    return true;
}

function setPurchaseDetails() {
    purchase.details = {};
    var fields = checkPurchaseFields();
    if (fields.false.length) throw new Error('Invalid purchase fields remain! ' + fields.false.join(', '));
    $('#details input[type="text"], #details input[type="email"], #details textarea').each(function() {
        purchase.details[this.id] = $(this).val();
    });
    $('#details input[type="checkbox"]').each(function() {
        purchase.details[this.id] = $(this).is(':checked');
    });
}

function markValidDetails(ev) {
    var fields = checkPurchaseFields();
    if (fields.false.length) {
        var why = 'Required fields: ' + fields.false.join(', ').replace(/#/g, '');
        $('#stripe-checkout').prop('disabled', true);
        $('#checkout-why').html(why);
    } else {
        $('#stripe-checkout').prop('disabled', false);
        $('#checkout-why').html('');
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
        $(this).next().addClass('glyphicon-ok').parent().addClass('has-success');
    });
}

function myScrollTo(scrollTo, focus) {
    $('html, body').animate({ scrollTop: $(scrollTo).offset().top - 20 }, 1000,
                            function() { $(focus).focus(); });
}

function setDiscountPrices() {
    var firstType, youthType;
    if (purchase.youth) {
        firstType = 'firstCon-youth';
        youthType = 'youth-adult';
    } else if (purchase.firstCon) {
        firstType = 'firstCon-adult';
        youthType = 'youth-firstCon';
    } else {
        firstType = 'firstCon-adult';
        youthType = 'youth-adult';
    }
    $('#first-price').text(function(){ return prettyPriceForType(firstType); });
    $('#youth-price').text(function(){ return prettyPriceForType(youthType); });
}

// Set button texts
$(function () {
    $('.price').text(function() {
        return prettyPriceForType($(this).data('type'));
    });
    $('#type input').on('click', function() {
        $('#type input').removeClass('active btn-primary').addClass('btn-default');
        $(this).addClass('active btn-primary').removeClass('btn-default');
        purchase.type = this.id.split('-', 1)[0];
        purchase.upgrade = null;
        setPurchaseAmountAndDescription();
        $('.for-attending, .for-children').hide();
        switch (this.id) {
            case 'adult-btn':
                $('.for-attending').show();
                // fallthrough
            case 'youth-btn':
                $('#upgrade').show();
                $('#details').hide();
                var prevUpgrade = $('#upgrade .active');
                if (prevUpgrade.length) prevUpgrade.click();
                else myScrollTo('#upgrade', '#upgrade-btn');
                break;
            case 'child-btn':
                $('.for-children').show();
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

    $('#first-con').on('change', function() {
        purchase.firstCon = this.checked;
        setPurchaseAmountAndDescription();
        setDiscountPrices();
    });

    $('#youth').on('change', function() {
        purchase.youth = this.checked;
        setPurchaseAmountAndDescription();
        setDiscountPrices();
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
                       .replace('Membership', 'Member')
                       .replace('publications', 'pubs')
                       .replace(/ \([^)]*\d+\)$/, '');
        stripeHandler.open({
            currency: purchase.currency,
            description: desc,
            amount: purchase.amount,
            email: purchase.details.email
        });
    });
});

// Close Checkout on page navigation
$(window).on('popstate', function() {
    stripeHandler.close();
});
