export const buyMembership = (member, amount, token, callback) => ({
  module: 'kansa',
  type: 'BUY_MEMBERSHIP',
  amount,
  callback,
  member,
  token
});

// items: [{ category, comments, data, email, invoice, name, person_id, type }]
export const buyOther = (account, token, items, callback) => ({
  module: 'kansa',
  type: 'BUY_OTHER',
  account,
  callback,
  items,
  token
});

export const buyUpgrade = (id, membership, paper_pubs, amount, token, callback) => ({
  module: 'kansa',
  type: 'BUY_UPGRADE',
  amount,
  callback,
  id,
  membership,
  paper_pubs,
  token
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
