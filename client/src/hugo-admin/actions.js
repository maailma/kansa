export const addCanon = ({ category, id, nomination, disqualified, relocated }) => ({
  module: 'hugo-admin',
  type: 'ADD_CANON',
  category,
  disqualified,
  id,
  nomination,
  relocated
});

export const addClassification = ({ canon_id, category, nomination }) => ({
  module: 'hugo-admin',
  type: 'ADD_CLASSIFICATION',
  canon_id,
  category,
  nomination
});

export const classify = (category, nominations, canon) => ({
  module: 'hugo-admin',
  type: 'CLASSIFY',
  canon,
  category,
  nominations
});

export const fetchAllBallots = () => ({
  module: 'hugo-admin',
  type: 'FETCH_ALL_BALLOTS'
});

export const fetchBallots = (category) => ({
  module: 'hugo-admin',
  type: 'FETCH_BALLOTS',
  category
});

export const initHugoAdmin = () => ({
  module: 'hugo-admin',
  type: 'INIT_HUGO_ADMIN'
});

export const setCanon = (category, canon) => ({
  module: 'hugo-admin',
  type: 'SET_CANON',
  canon,
  category
});

export const setNominations = (category, nominations) => ({
  module: 'hugo-admin',
  type: 'SET_NOMINATIONS',
  category,
  nominations
});

export const setShowBallotCounts = (show = true) => ({
  module: 'hugo-admin',
  type: 'SET_SHOW_BALLOT_COUNTS',
  show: !!show
});

export const updateCanonEntry = (canon_id, category, nomination) => ({
  module: 'hugo-admin',
  type: 'UPDATE_CANON_ENTRY',
  canon_id,
  category,
  nomination
});
