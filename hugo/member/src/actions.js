export const editNomination = (category, index, nomination) => ({
  stage: 'nomination',
  type: 'EDIT',
  category,
  index,
  nomination
});

export const submitNominations = (category) => ({
  stage: 'nomination',
  type: 'SUBMIT',
  category
});

export const resetNominations = (category) => ({
  stage: 'nomination',
  type: 'RESET',
  category
});

export const setNominations = ({ category, nominations, time }) => ({
  stage: 'nomination',
  type: 'SET',
  category,
  nominations,
  time
});

export const submitNominationError = (category, error) => ({
  stage: 'nomination',
  type: 'ERROR',
  category,
  error
});

export const clearNominationError = (category) => ({
  stage: 'nomination',
  type: 'CLEAR ERROR',
  category
});

