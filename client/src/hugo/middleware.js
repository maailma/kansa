import { setPerson, showMessage } from '../app/actions/app'
import { getNominations } from './actions'
import { API_ROOT } from '../constants'
import { categories, nominationFields } from './constants'

import API from '../lib/api'
const api = new API(API_ROOT);


function setNominator(dispatch, { person }) {
  if (!person) throw new Error(`Required parameter: person <${person}>`);

  dispatch(setPerson(person));
  api.GET(`hugo/${person}/nominations`)
    .then(data => {
      data.forEach(catData => dispatch(getNominations(catData)));
    })
    .catch(err => dispatch(showMessage(err.message)));
}

function submitNominations(dispatch, { app, nominations }, { category }) {
  const person = app.get('person');
  if (!person || person < 0 || !category) throw new Error(`Required parameters: person <${person}>, category <${category}>`);

  const list = nominations.getIn([category, 'clientData']).filter(nom => nom);
  if (!list) throw new Error(`Nominations for category ${JSON.stringify(category)} not found!`);
  if (list.equals(nominations.getIn([category, 'serverData']))) return;

  const fields = nominationFields(category);
  if (list.some(nomination => nomination.some((_, field) => fields.indexOf(field) === -1))) {
    throw new Error(`Unknown key in nomination data: ${JSON.stringify(list.toJS())}`);
  }

  api.POST(`hugo/${person}/nominate`, { category, nominations: list.toJS() })
    .then(res => dispatch(getNominations(res)))
    .catch(err => dispatch(showMessage(err.message)));
}

export default ({ dispatch, getState }) => (next) => (action) => {
  if (action.error || action.module !== 'hugo-nominations') return next(action);
  try { switch (action.type) {

    case 'SET_NOMINATOR':
      setNominator(dispatch, action);
      break;

    case 'SUBMIT_NOMINATIONS':
      submitNominations(dispatch, getState(), action);
      break;

  }} catch (error) {
    return next({ ...action, error });
  }

  next(action);
}
