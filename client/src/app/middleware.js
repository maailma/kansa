export default ({ dispatch }) => (next) => (action) => {
  next(action);

  if (action.error) {
    const message = action.error.message || action.error.status;
    console.error(`${action.type} error` + (message ? `: ${message}` : ''), action);
    if (window.ga) ga('send', 'exception', { exDescription: message, exFatal: false });

  } else switch (action.type) {

    case 'SET_TITLE':
      action.title = action.title ? `${TITLE} ${action.title}` : TITLE;
      document.title = action.title;
      return next(action);

    case 'SHOW_MESSAGE':
      console.log(action.message);
      break;

  }
}
