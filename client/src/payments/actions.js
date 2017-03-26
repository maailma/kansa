export const buyMembership = (member, amount, token, callback) => ({
  module: 'kansa',
  type: 'BUY_MEMBERSHIP',
  amount,
  callback,
  member,
  token
});

// purchase: { comments, data, email, invoice, name, person, type }
export const buyOther = (purchase, amount, token, callback) => ({
  module: 'kansa',
  type: 'BUY_OTHER',
  amount,
  callback,
  purchase,
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
