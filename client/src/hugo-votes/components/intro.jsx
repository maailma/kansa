import { Map } from 'immutable'
import React from 'react'
import { Link } from 'react-router'

import { Card, CardHeader, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider'

import { ConfigConsumer } from '../../lib/config-context'
import VoteIntroText from './intro-text'
import VoteSignature from './signature'

const preferredName = person => {
  if (!Map.isMap(person)) return '<>'
  const pna = [person.get('public_first_name'), person.get('public_last_name')]
  const pns = pna.filter(s => s).join(' ')
  return pns || person.get('legal_name')
}

const VoteIntro = ({ person, setSignature, signature }) => (
  <ConfigConsumer>
    {({ getMemberAttr }) => (
      <Card>
        <VoteIntroText />
        <Divider />
        {signature ? (
          <CardHeader
            style={{ padding: '16px 32px' }}
            textStyle={{ paddingRight: 0 }}
            title={`Signing as "${signature}"`}
          />
        ) : getMemberAttr(person).wsfs_member ? (
          <VoteSignature
            person={person}
            preferredName={preferredName(person)}
            setSignature={setSignature}
          />
        ) : (
          <CardText style={{ padding: '16px 32px' }}>
            <p>
              To access Hugo Award voting, please use a personal login link sent
              to you by email.
            </p>
            <p>
              If your email address is associated with more than one membership
              that is eligible to vote or nominate in the 2017 Hugo Awards,
              you'll need to use the separately emailed Hugo login link to
              access those services. For further assistance with Hugo
              nominations, please e-mail{' '}
              <a href="mailto:hugohelp@worldcon.fi">hugohelp@worldcon.fi</a>.
            </p>
            <p>
              <Link to="/">&laquo; Return to the main member page</Link>
            </p>
          </CardText>
        )}
      </Card>
    )}
  </ConfigConsumer>
)

export default VoteIntro
