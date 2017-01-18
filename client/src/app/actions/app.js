export const setPerson = (person) => ({
  type: 'SET_PERSON',
  person
});

export const setTitle = (title) => ({
  type: 'SET_TITLE',
  title
});

export const showMessage = (message) => ({
  type: 'SHOW_MESSAGE',
  message
});

export const hideMessage = () => ({
  type: 'HIDE_MESSAGE'
});
