export const setPerson = (person) => ({
  type: 'SET_PERSON',
  person
});

export const setScene = ({ title = '', dockSidebar = true }) => ({
  type: 'SET_SCENE',
  dockSidebar,
  title
});

export const showMessage = (message) => ({
  type: 'SHOW_MESSAGE',
  message
});

export const hideMessage = () => ({
  type: 'HIDE_MESSAGE'
});
