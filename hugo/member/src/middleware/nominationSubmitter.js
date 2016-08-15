import { setNominations, submitNominationError } from '../actions'
import { categories, nominationFields } from '../hugoinfo'

export default (api) => (store) => (next) => (action) => {
  if (action.error || action.stage !== 'nomination' || action.type !== 'SUBMIT') return next(action);

  const category = action.category;
  const state = store.getState();
  const nominations = state.nominations[category];
  if (!nominations) throw new Error(`Nominations for category ${JSON.stringify(category)} not found!`);

  const list = nominations.get('clientData').filter(nom => nom);
  if (list.equals(nominations.get('serverData'))) return;

  const fields = nominationFields(category);
  if (list.keySeq().some(key => fields.indexOf(key) === -1)) {
    action.error = `Unknown key in nomination data for ${category}: ${JSON.stringify(list.toJS())}`;
    return next(action);
  }

  if (!state.person.id) {
    action.error = `Attempt to submit nomination for ${category} with no key?!`;
    return next(action);
  }

  next(action);
  return api.POST(`hugo/${state.person.id}/nominate`, { category, nominations: list.toJS() })
    .then(res => next(setNominations(res)))
    .catch(err => next(submitNominationError(category, err.message)));
}
