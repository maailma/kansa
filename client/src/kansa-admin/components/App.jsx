import { List, Map } from 'immutable'
import Snackbar from 'material-ui/Snackbar'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import api from '../../lib/api'
import {
  ConfigProvider,
  defaultConfig,
  getConfig
} from '../../lib/config-context'
import BarcodeListener from './barcode-listener'
import PaymentTable from './PaymentTable'
import PeopleScene from './PeopleScene'
import Toolbar from './Toolbar'

class App extends React.Component {
  static propTypes = {
    hideMessage: PropTypes.func.isRequired,
    message: PropTypes.string,
    people: PropTypes.instanceOf(List).isRequired,
    user: PropTypes.instanceOf(Map).isRequired
  }

  static defaultProps = {
    title: 'Kansa'
  }

  state = {
    config: defaultConfig,
    filter: '',
    member: null,
    scene: 'people'
  }

  componentDidMount() {
    if (this.toolbar) this.toolbar.focus()
    const appTitle = App.defaultProps.title
    document.title =
      TITLE.indexOf(appTitle) === -1 ? `${appTitle} - ${TITLE}` : TITLE
    getConfig().then(config => this.setState({ config }))
  }

  componentWillReceiveProps({ people }) {
    if (this.state.member) {
      const id = this.state.member.get('id')
      const member = people && people.find(m => m && m.get('id') === id)
      if (member) this.setState({ member })
    }
  }

  handleBarcode = code => {
    const { people } = this.props
    if (this.state.member) return this.setState({ filter: '' })
    const [_, isId, numStr] = code.match(/^..(i?)(\d+)/)
    const num = Number(numStr)
    const member = isId
      ? people.get(num)
      : people.find(p => p && p.get('member_number') === num)
    this.setState({ filter: '', member })
  }

  handleSubmitFilter = () => {
    const { filter } = this.state
    const { people } = this.props
    const num = Number(filter)
    const member =
      (num && people.find(p => p && p.get('member_number') === num)) || null
    this.setState({ member })
  }

  render() {
    const { hideMessage, message, user } = this.props
    const { config, filter, member, scene } = this.state
    if (!Map.isMap(user) || user.size === 0) {
      return <div>Login required.</div>
    } else if (!user.get('member_admin') && !user.get('member_list')) {
      return <div>User not authorised</div>
    }
    return (
      <ConfigProvider value={config}>
        <BarcodeListener
          onBarcode={this.handleBarcode}
          pattern={/^[A-Z].i?\d+$/}
        >
          <Toolbar
            filter={filter}
            onFilterChange={filter => this.setState({ filter })}
            onLogout={() =>
              api
                .GET('logout')
                .then(res => location.reload())
                .catch(e => window.alert('Logout failed: ' + e.message))
            }
            onSceneChange={scene => this.setState({ scene })}
            onSubmitFilter={this.handleSubmitFilter}
            ref={ref => {
              this.toolbar = ref && ref.getWrappedInstance()
            }}
            scene={scene}
          />
          {scene === 'people' ? (
            <PeopleScene
              api={api}
              filter={filter}
              member={member}
              onMemberSelect={member =>
                this.setState({ member }, () => {
                  if (!member && this.toolbar) this.toolbar.focus()
                })
              }
            />
          ) : (
            <PaymentTable
              filter={filter}
              onPaymentSelect={payment =>
                console.log('payment', payment.toJS())
              }
            />
          )}
          <Snackbar
            autoHideDuration={3000}
            bodyStyle={{
              height: 'auto',
              lineHeight: '22px',
              opacity: 0.85,
              paddingBottom: 13,
              paddingTop: 13
            }}
            message={message}
            onRequestClose={hideMessage}
            open={!!message}
          />
        </BarcodeListener>
      </ConfigProvider>
    )
  }
}

export default connect(
  ({ app, people, user }) => ({
    message: app.get('message'),
    people,
    user
  }),
  dispatch => ({
    hideMessage: () => dispatch({ type: 'SET MESSAGE', message: '' })
  })
)(App)
