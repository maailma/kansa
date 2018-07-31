import { List, Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

import InvoiceForm from './InvoiceForm'

const preferredName = (person) => {
  if (!Map.isMap(person)) return '<>'
  const pna = [person.get('public_first_name'), person.get('public_last_name')]
  return pna.filter(s => s).join(' ') || person.get('legal_name')
}

class NewInvoice extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    person: ImmutablePropTypes.mapContains({
      email: PropTypes.string,
      legal_name: PropTypes.string,
      public_first_name: PropTypes.string,
      public_last_name: PropTypes.string
    })
  }

  state = {
    invoice: {},
    open: false,
    sent: false
  }

  get disableSubmit () {
    const { paymentData } = this.props
    const { amount, category, data, type } = this.state.invoice
    return !category || !type || !amount || !data || !paymentData ||
      paymentData
        .getIn([category, 'shape'], List())
        .some(shape => shape.get('required') && !data[shape.get('key')])
  }

  handleOpen = () => {
    const { person } = this.props
    this.setState({
      invoice: {
        person_email: person.get('email'),
        person_id: person.get('id'),
        person_name: preferredName(person)
      },
      open: true,
      sent: false
    })
  }

  handleClose = () => { this.setState({ open: false }) }

  render () {
    const { children, onSubmit, paymentData } = this.props
    const { invoice, open, sent } = this.state
    return (
      <div>
        { React.cloneElement(React.Children.only(children), { onClick: this.handleOpen }) }
        <Dialog
          title='Add new invoice'
          open={open}
          autoScrollBodyContent
          bodyClassName='invoiceDialog'
          onRequestClose={this.handleClose}
          actions={[
            <FlatButton key='cancel' label='Cancel' onClick={this.handleClose} />,
            <FlatButton key='add'
              label={sent ? 'Working...' : 'Add'}
              disabled={this.disableSubmit}
              onClick={() => {
                this.setState({ sent: true })
                onSubmit(invoice)
                  .then(res => {
                    console.log('New invoice added', res)
                    this.handleClose()
                  })
                  .catch(e => console.error('New invoice addition failed', e))
              }}
            />
          ]}
        >
          <InvoiceForm
            invoice={invoice}
            onChange={update => this.setState({ invoice: Object.assign({}, this.state.invoice, update) })}
            paymentData={paymentData}
          />
        </Dialog>
      </div>
    )
  }
}

export default connect(
  ({ paymentData }) => ({
    paymentData
  })
)(NewInvoice)
