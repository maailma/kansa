export default name => {
  switch (name) {
    case 'slack':
      return import(/* webpackChunkName: "slack" */ '@kansa/client-slack-module')
    default:
      return null
  }
}
