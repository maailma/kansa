var stripePublicKey = 'pk_live_vSEBxO9ddioYqCGvhVsog4pb';
//var stripePublicKey = 'pk_test_LoOP8RB3gIlLkSYIyM9G6skn';

var memberships = {
  adult: { currency: "eur", amount: 12000, description: "Adult Membership" },
  firstCon: { currency: "eur", amount: 9500, description: "First Worldcon Membership" },
  youth: { currency: "eur", amount: 9000, description: "Youth Membership" },
  child: { currency: "eur", amount: 6000, description: "Child Membership" },
  kidInTow: { currency: "eur", amount: 0, description: "Kid-in-tow Membership" },
  support: { currency: "eur", amount: 3500, description: "Supporting Membership" },
  paperPubs: { currency: "eur", amount: 1000, description: "Paper publications" }
};
