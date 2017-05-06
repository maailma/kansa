export const buyMembership = (member, amount, email, source, callback) => ({
  module: 'kansa',
  type: 'BUY_MEMBERSHIP',
  amount,
  callback,
  email,
  member,
  source
});

// items: [{ category, comments, data, email, invoice, name, person_id, type }]
export const buyOther = (account, email, source, items, callback) => ({
  module: 'kansa',
  type: 'BUY_OTHER',
  account,
  callback,
  email,
  items,
  source
});

export const buyUpgrade = (id, membership, paper_pubs, amount, email, source, callback) => ({
  module: 'kansa',
  type: 'BUY_UPGRADE',
  amount,
  callback,
  email,
  id,
  membership,
  paper_pubs,
  source
});

export const getPrices = () => ({
  module: 'kansa',
  type: 'GET_PRICES'
});

export const getPurchaseData = () => ({
  module: 'kansa',
  type: 'GET_PURCHASE_DATA'
});

export const getPurchaseList = () => ({
  module: 'kansa',
  type: 'GET_PURCHASE_LIST'
});

export const getStripeKeys = () => ({
  module: 'kansa',
  type: 'GET_STRIPE_KEYS'
});
