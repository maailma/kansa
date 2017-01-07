export const getPrices = () => ({
  module: 'kansa',
  type: 'GET_PRICES'
});

export const memberSet = ({ email, people, roles }) => ({
  module: 'kansa',
  type: 'MEMBER_SET',
  email,
  people,
  roles
});

export const memberUpdate = (id, changes) => ({
  module: 'kansa',
  type: 'MEMBER_UPDATE',
  id,
  changes
});
