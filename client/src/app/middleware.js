export default ({ dispatch }) => (next) => (action) => {
  next(action);

  if (action.error) {
    const message = action.error.message || action.error.status;
    console.error(`${action.type} error` + (message ? `: ${message}` : ''), action);

  } else switch (action.type) {

    case 'SHOW_MESSAGE':
      console.log(action.message);
      break;

  }
}
