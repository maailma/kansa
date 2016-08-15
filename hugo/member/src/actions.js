export const editNomination = (category, index, nomination) => ({
  stage: 'nomination',
  type: 'EDIT',
  category,
  index,
  nominations
});

export const submitNominations = (category) => ({
  stage: 'nomination',
  type: 'SUBMIT',
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

