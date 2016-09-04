import { setNominations, submitNominationError } from '../actions'
import { categories, nominationFields } from '../hugoinfo'

export default (api) => (store) => (next) => (action) => {
  //console.log('middleware', action);
  if (action.error || action.stage !== 'nomination' || action.type !== 'SUBMIT') return next(action);

  const category = action.category;
  const { nominations, person } = store.getState();

  const list = nominations.getIn([category, 'clientData']).filter(nom => nom);
  if (!list) throw new Error(`Nominations for category ${JSON.stringify(category)} not found!`);
  if (list.equals(nominations.getIn([category, 'serverData']))) return;

  const fields = nominationFields(category);
  if (list.some(nomination => nomination.some((_, field) => fields.indexOf(field) === -1))) {
    action.error = `Unknown key in nomination data: ${JSON.stringify(list.toJS())}`;
    return next(action);
  }

  const id = person.get('id');
  if (!id) {
    action.error = `Attempt to submit nomination with no key?!`;
    return next(action);
  }

  next(action);
  return api.POST(`hugo/${id}/nominate`, { category, nominations: list.toJS() })
    .then(res => next(setNominations(res)))
    .catch(err => next(submitNominationError(category, err.message)));
}
