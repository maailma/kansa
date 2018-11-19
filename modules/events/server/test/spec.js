const printErrors = ({ errors }) => {
  for (const { message, locations, stack } of errors) {
    console.error('Error:', message, 'at:', locations)
    console.warn('\u001b[90m' + stack + '\u001b[0m')
  }
}

module.exports = Agent => {
  const agent = new Agent()
  let user
  before(() =>
    agent
      .loginAsMember()
      .expect(200)
      .then(() => agent.get('/api/user'))
      .then(res => {
        user = res.body.people[0]
      })
  )

  it('Gets own email', () =>
    agent
      .post('/api/events/graphql')
      .send({ query: '{ currentUserEmail }' })
      .expect(200, { data: { currentUserEmail: user.email } }))

  it('Has own id', () =>
    agent
      .post('/api/events/graphql')
      .send({
        query: 'query HasId($id: Int!) { currentUserHasId(personId: $id) }',
        variables: { id: user.id }
      })
      .expect(200, { data: { currentUserHasId: true } }))

  it('Does not have other id', () =>
    agent
      .post('/api/events/graphql')
      .send({
        query: 'query HasId($id: Int!) { currentUserHasId(personId: $id) }',
        variables: { id: user.id - 1 }
      })
      .expect(200, { data: { currentUserHasId: null } }))
}
