import { List, Map } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import BarcodeListener from './barcode-listener'
import PaymentTable from './PaymentTable';
import PeopleScene from './PeopleScene'
import Toolbar from './Toolbar';

class App extends React.Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    people: PropTypes.instanceOf(List).isRequired,
    user: PropTypes.instanceOf(Map).isRequired
  }

  static defaultProps = {
    title: 'Kansa'
  }

  state = {
    filter: '',
    member: null,
    scene: 'people'
  }

  componentDidMount () {
    if (this.toolbar) this.toolbar.focus()
    const appTitle = App.defaultProps.title
    document.title = TITLE.indexOf(appTitle) === -1 ? `${appTitle} - ${TITLE}` : TITLE
  }

  componentWillReceiveProps ({ list }) {
    if (this.state.member) {
      const id = this.state.member.get('id')
      const member = list && list.find(m => m && m.get('id') === id) || null
      this.setState({ member })
    }
  }

  handleBarcode = (code) => {
    const { people } = this.props
    if (this.state.member) return this.setState({ filter: '' })
    const [_, isId, numStr] = code.match(/^.-(i?)(\d+)/)
    const num = Number(numStr)
    const member = isId
      ? people.get(num)
      : people.find(p => p && p.get('member_number') === num)
    this.setState({ filter: '', member })
  }

  render () {
    const { api, people, user } = this.props
    const { filter, member, scene } = this.state
    if (!Map.isMap(user) || user.size === 0) {
      return <div>Login required.</div>
    } else if (!user.get('member_admin') && !user.get('member_list')) {
      return <div>User not authorised</div>
    }
    return <BarcodeListener
      onBarcode={this.handleBarcode}
      pattern={/^[A-Z]-i?\d+$/}
    >
      <Toolbar
        filter={filter}
        onFilterChange={filter => this.setState({ filter })}
        onLogout={() => api.GET('logout')
          .then(res => location.reload())
          .catch(e => console.error('Logout failed', e))
        }
        onSceneChange={scene => this.setState({ scene })}
        ref={ref => { this.toolbar = ref && ref.getWrappedInstance() }}
        scene={scene}
      />

      {scene === 'people' ? (
        <PeopleScene
          api={api}
          filter={filter}
          member={member}
          onMemberSelect={member => this.setState({ member }, () => {
            if (!member && this.toolbar) this.toolbar.focus()
          })}
        />
      ) : (
        <PaymentTable
          filter={filter}
          onPaymentSelect={payment => console.log('payment', payment.toJS())}
        />
      )}
    </BarcodeListener>
  }
}

export default connect(
  ({ people, user }) => ({
    people,
    user
  })
)(App)
