import React from 'react'

import KeyRequest from '../app/components/KeyRequest'
import Intro from './Intro'

export default () => <div style={{
  margin: '0 auto',
  maxWidth: 710
}}>

  <Intro showMore={true}/>
  <p>
    To participate in the 1980 Timewarp Project, please enter your email address below, and a login link will be sent to
    you by email. We hope you enjoy thinking back to an earlier time.
  </p>
  <KeyRequest/>

</div>;
