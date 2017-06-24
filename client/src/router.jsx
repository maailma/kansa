import React, { PropTypes } from 'react'
import { IndexRedirect, IndexRoute, Redirect, Route, Router } from 'react-router'

import { keyLogin, tryLogin } from './app/actions/auth'

import App from './app/components/App'
import Index from './app/components/Index'
import Canon from './hugo-admin/components/Canon'
import Nominate from './hugo-nominations/components/Nominate'
import Vote from './hugo-votes'
import Finalists from './hugo-admin/components/Finalists'
import HugoAdmin from './hugo-admin/components/HugoAdmin'
import NewDaypassForm from './membership/components/NewDaypassForm'
import NewMemberForm from './membership/components/NewMemberForm'
import NewMemberIndex from './membership/components/NewMemberIndex'
import TekMemberForm from './membership/components/TekMemberForm'
import TekMemberIndex from './membership/components/TekMemberIndex'
import Upgrade from './membership/components/Upgrade'
import Payments from './payments'
import NewPayment from './payments/new-payment'
import ExhibitRegistration from './raami/components/Registration'

const hugoRoutes = (path, requireAuth) => (
  <Route path={path} >
    <IndexRedirect to="vote" />
    <Route path="admin" onEnter={requireAuth} component={HugoAdmin}>
      <IndexRedirect to='Novel' />
      <Route path=":category">
        <IndexRedirect to='nominations' />
        <Route path="finalists" component={Finalists} />
        <Route path="nominations" component={Canon} />
      </Route>
    </Route>
    <Route path="nominate/:id" onEnter={requireAuth} component={Nominate} />
    <Route path="vote">
      <IndexRoute component={Vote} />
      <Route path=":id" component={Vote} />
    </Route>
    <Redirect from=":id/nominate" to="nominate/:id" />
    <Redirect from=":id/vote" to="vote/:id" />
  </Route>
)

export default class AppRouter extends Route {
  static contextTypes = {
    store: PropTypes.shape({
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }).isRequired
  }

  get dispatch() {
    return this.context.store.dispatch
  }

  get userEmail() {
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

  requireAuth = ({ location: { pathname }}, replace) => {
    if (!this.userEmail && pathname !== '/') replace('/');
  }

  scrollUpOnChange = (_, { location: { action } }) => {
    if (action !== 'POP') window.scrollTo(0, 0)
  }

  render() {
    const { history } = this.props
    return (
      <Router history={history}>
        <Route path="/login/:email/:key" onEnter={this.doLogin} />
        <Route path="/login/:email/:key/:id" onEnter={this.doLogin} />
        <Route path="/" component={App} onChange={this.scrollUpOnChange} onEnter={this.checkAuth} >
          <IndexRoute component={Index} />
          <Redirect from="login" to="/" />
          <Redirect from="profile" to="/" />
          <Route path="exhibition/:id" component={ExhibitRegistration} onEnter={this.requireAuth} />
          {hugoRoutes('hugo', this.requireAuth)}
          <Route path="daypass/:type" component={NewDaypassForm} />
          <Route path="new" component={NewMemberIndex} />
          <Route path="new/:membership" component={NewMemberForm} />
          <Route path="pay" component={Payments} />
          <Route path="pay/:type" component={NewPayment} />
          <Route path="tek" component={TekMemberIndex} />
          <Route path="tek/:membership" component={TekMemberForm} />
          <Route path="upgrade" onEnter={this.requireAuth}>
            <IndexRoute component={Upgrade} />
            <Route path=":id" component={Upgrade} />
          </Route>
        </Route>
      </Router>
    )
  }
}
