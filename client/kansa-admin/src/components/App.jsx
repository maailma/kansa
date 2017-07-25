import { List, Map } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import filterPeople from '../filterPeople';
import BarcodeListener from './barcode-listener'
import { HelpDialog } from './Help';
import RegOptionsDialog from './RegistrationOptions';
import Member from './Member';
import MemberTable from './MemberTable';
import NewMember from './NewMember';
import PaymentTable from './PaymentTable';
import Toolbar from './Toolbar';

class App extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    api: PropTypes.object.isRequired,
    people: PropTypes.instanceOf(List).isRequired,
    user: PropTypes.instanceOf(Map).isRequired
  }

  static defaultProps = {
    title: 'Kansa'
  }

  state = {
    filter: '',
    helpOpen: false,
    member: null,
    regOpen: false,
    scene: 'people'
  }

  constructor(props) {
    super(props);
    const defaultTitle = App.defaultProps.title;
    let title = props.title;
    if (title.indexOf(defaultTitle) === -1) title = `${defaultTitle} - ${title}`;
    document.title = title;
  }

  componentDidMount () {
    if (this.toolbar) this.toolbar.focus()
  }

  componentWillReceiveProps(nextProps) {
    const prevMember = this.state.member;
    if (prevMember) {
      const id = prevMember.get('id');
      const member = nextProps.list && nextProps.list.find(m => m && m.get('id') === id) || null;
      this.setState({ member });
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

  render() {
    const { title, api, payments, people, user } = this.props
    const { filter, helpOpen, member, regOpen, scene } = this.state
    return <BarcodeListener
      onBarcode={this.handleBarcode}
      pattern={/^[A-Z]-i?\d+$/}
    >
      <Toolbar
        title={title}
        filter={filter}
        user={user}
        onFilterChange={filter => this.setState({ filter })}
        onHelp={() => this.setState({ helpOpen: true })}
        onLogout={() => api.GET('logout')
          .then(res => location.reload())
          .catch(e => console.error('Logout failed', e))
        }
        onRegOptions={() => this.setState({ regOpen: true })}
        onSceneChange={scene => this.setState({ scene })}
        ref={ref => { this.toolbar = ref }}
        scene={scene}
      />

      {scene === 'people' ? [
        <MemberTable
          key="table"
          list={filterPeople(people, filter)}
          onMemberSelect={member => this.setState({ member })}
        />,
        <Member
          key="dialog"
          api={api}
          handleClose={() => this.setState({ member: null }, () => { if (this.toolbar) this.toolbar.focus() })}
          member={member}
        />,
        <NewMember key="new" add={member => api.POST('people', member.toJS())}>
          <FloatingActionButton style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
            <ContentAdd />
          </FloatingActionButton>
        </NewMember>
      ] : [
        <PaymentTable
          key="table"
          list={filterPeople(payments, filter)}
          onPaymentSelect={payment => console.log('payment', payment.toJS())}
        />
      ]}

      <HelpDialog
        open={helpOpen}
        handleClose={() => this.setState({ helpOpen: false })}
      />
      <RegOptionsDialog
        onClose={() => this.setState({ regOpen: false })}
        open={regOpen}
      />
    </BarcodeListener>
  }
}

export default connect(state => state)(App);
