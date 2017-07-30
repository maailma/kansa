export const setNominator = (person) => ({
  module: 'hugo-nominations',
  type: 'SET_NOMINATOR',
  person
})

export const getNominations = ({ category, nominations, time }) => ({
  module: 'hugo-nominations',
  type: 'GET_NOMINATIONS',
  category,
  nominations,
  time
})

export const editNomination = (category, index, nomination) => ({
  module: 'hugo-nominations',
  type: 'EDIT_NOMINATIONS',
  category,
  index,
  nomination
})

export const submitNominations = (category, signature) => ({
  module: 'hugo-nominations',
  type: 'SUBMIT_NOMINATIONS',
  category,
  signature
})

export const resetNominations = (category) => ({
  module: 'hugo-nominations',
  type: 'RESET_NOMINATIONS',
  category
})

export const submitNominationError = (category, error) => ({
  module: 'hugo-nominations',
  type: 'NOMINATIONS_ERROR',
  category,
  error
})

export const clearNominationError = (category) => ({
  module: 'hugo-nominations',
  type: 'CLEAR_NOMINATIONS_ERROR',
  category
})
