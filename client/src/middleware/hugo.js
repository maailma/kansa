import { setNominations, submitNominationError } from '../actions/hugo'
import { showMessage } from '../actions/app'
import { API_ROOT } from '../constants'
import { categories, nominationFields } from '../constants/hugo'

import API from '../api'
const api = new API(API_ROOT);

export default ({ dispatch, getState }) => (next) => (action) => {
  if (action.error || action.module !== 'hugo-nominations' || action.type !== 'SUBMIT') return next(action);
  const handleError = (error) => next({ ...action, error });

  const { person, category } = action;
  if (!person || !category) return handleError('Required parameters: person, category');

  const { nominations } = getState();
  const list = nominations.getIn([category, 'clientData']).filter(nom => nom);
  if (!list) return handleError(`Nominations for category ${JSON.stringify(category)} not found!`);
  if (list.equals(nominations.getIn([category, 'serverData']))) return;

  const fields = nominationFields(category);
  if (list.some(nomination => nomination.some((_, field) => fields.indexOf(field) === -1))) {
    return handleError(`Unknown key in nomination data: ${JSON.stringify(list.toJS())}`);
  }

  next(action);
  return api.POST(`hugo/${person}/nominate`, { category, nominations: list.toJS() })
    .then(res => dispatch(setNominations(res)))
    .catch(err => dispatch(submitNominationError(category, err.message)));
}
