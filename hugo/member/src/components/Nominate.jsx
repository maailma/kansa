import React from 'react'
import { connect } from 'react-redux'

import NominationCategory from './NominationCategory'
import { categories } from '../hugoinfo'


const ActiveNominations = () => <div>
  <p>Introduction to Hugo nominations</p>
  {
    categories.map(category => <NominationCategory
      key={category}
      category={category}
      active={true}
    />)
  }
</div>;


const connectSetCategories = connect(state => ({
  setCategories: Object.keys(state.nominations).filter(category => 
    !state.nominations[category].get('serverData').isEmpty()
  )
}));

const InactiveNominations = connectSetCategories(({ setCategories }) => <div>
  <p>Hugo voting is not currently available</p>
  { setCategories.isEmpty() ? null : <p>... but here are the nominations we've got from you previously:</p> }
  {
    setCategories.map(category => <NominationCategory
      key={category}
      category={category}
      active={false}
    />)
  }
</div>);


const NominationsNotAllowed = () => <div>
  <p>Unfortunately, it looks like you don't have the right to nominate for the Hugo Awards.</p>
</div>;


const Nominate = ({ nominator }) => nominator ? <ActiveNominations /> : <NominationsNotAllowed />;

export default connect(state => ({
  nominator: !!state.person.get('can_hugo_nominate'),
  person: state.person.toJS()
}))(Nominate);

/*
export default connect(
  (state) => ({
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }),
  (dispatch) => ({
    onTodoClick: (id) => dispatch(toggleTodo(id))
  })
)(Nominate)
*/
