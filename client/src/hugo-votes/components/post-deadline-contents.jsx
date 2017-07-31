import { Card, CardText } from 'material-ui/Card'
import React from 'react'

const PostDeadlineContents = () => (
  <Card>
    <CardText className='vote-intro' style={{ padding: '16px 32px' }}>
      <h3>
        Thank you for having participated in the 2017 Hugo Awards and the John W. Campbell Award!
      </h3>

      <p>
        The Hugo Award is the leading award for excellence in the field of science fiction and fantasy. The Hugo Awards
        are awarded each year by the World Science Fiction Society (“WSFS”), at the World Science Fiction Convention
        (“Worldcon”). The finalists for the 2017 Hugo Awards and John W. Campbell Award for Best New Writer were
        announced on Tuesday 4 April 2017.
      </p>
      <p>
        The deadline for voting has now passed.
      </p>
      <p>
        The Hugo Awards will be presented at a formal ceremony on Friday 11 August 2017, at Worldcon 75, the 75th World
        Science Fiction Convention, in Helsinki, Finland. We currently plan to continue the recent tradition of
        streaming the ceremony live via the Internet, enabling fans around the world to experience the event.
      </p>
      <p>
        The official website of the Hugo Awards is <a href='http://thehugoawards.org/' target='_blank'>thehugoawards.org</a>,
        where you can find the full history of the Hugo Awards as well as the names of past finalists and winners,
        information about the voting process, a gallery of past trophy designs, and more.
      </p>
    </CardText>
  </Card>
)

export default PostDeadlineContents
