export const editNomination = (person, category, index, nomination) => ({
  module: 'hugo-nominations',
  type: 'EDIT',
  person,
  category,
  index,
  nomination
});

export const submitNominations = (person, category) => ({
  module: 'hugo-nominations',
  type: 'SUBMIT',
  person,
  category
});

export const resetNominations = (person, category) => ({
  module: 'hugo-nominations',
  type: 'RESET',
  person,
  category
});

export const setNominations = (person, { category, nominations, time }) => ({
  module: 'hugo-nominations',
  type: 'SET',
  person,
  category,
  nominations,
  time
});

export const submitNominationError = (person, category, error) => ({
  module: 'hugo-nominations',
  type: 'ERROR',
  person,
  category,
  error
});

export const clearNominationError = (person, category) => ({
  module: 'hugo-nominations',
  type: 'CLEAR ERROR',
  person,
  category
});

