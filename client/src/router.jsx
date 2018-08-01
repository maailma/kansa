import PropTypes from 'prop-types'
import React from 'react'
import { IndexRedirect, IndexRoute, Route, Router } from 'react-router'

import { keyLogin, tryLogin } from './app/actions/auth'
import App from './app/components/App'
import Index from './app/components/Index'
import Nominate from './hugo-nominations/components/Nominate'
import Vote from './hugo-votes'
import NewDaypassForm from './membership/components/NewDaypassForm'
import NewMemberForm from './membership/components/NewMemberForm'
import NewMemberIndex from './membership/components/NewMemberIndex'
import Upgrade from './membership/components/Upgrade'
import Payments from './payments'
import NewPayment from './payments/new-payment'

export default class AppRouter extends Route {
  static contextTypes = {
    store: PropTypes.shape({
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }).isRequired
  }

  get dispatch () {
    return this.context.store.dispatch
  }

  get userEmail () {
    return this.context.store.getState().user.get('email')
  }

  checkAuth = (nextState, replace, callback) => {
    if (this.userEmail) callback()
    else this.dispatch(tryLogin(() => callback()))
  }

  doLogin = ({ location: { query }, params: { email, key, id } }) => {
    const next = query && query.next || (id ? `/hugo/vote/${id}` : null)
    this.dispatch(keyLogin(email, key, next))
  }

  requireAuth = ({ location: { pathname } }, replace) => {
    if (!this.userEmail && pathname !== '/') replace('/')
  }

  scrollUpOnChange = (_, { location: { action } }) => {
    if (action !== 'POP') window.scrollTo(0, 0)
  }

  render () {
    return (
      <Router history={this.props.history}>
        <Route path='/login/:email/:key(/:id)' onEnter={this.doLogin} />
        <Route path='/' component={App} onChange={this.scrollUpOnChange} onEnter={this.checkAuth} >
          <IndexRoute component={Index} />
          <Route path='hugo' >
            <IndexRedirect to='vote' />
            <Route path='nominate/:id' onEnter={this.requireAuth} component={Nominate} />
            <Route path='vote(/:id)' component={Vote} />
          </Route>
          <Route path='daypass/:type' component={NewDaypassForm} />
          <Route path='new' component={NewMemberIndex} />
          <Route path='new/:membership' component={NewMemberForm} />
          <Route path='pay' component={Payments} />
          <Route path='pay/:type' component={NewPayment} />
          <Route path='upgrade(/:id)' component={Upgrade} onEnter={this.requireAuth} />
        </Route>
      </Router>
    )
  }
}
