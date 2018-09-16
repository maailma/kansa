export default name => {
  switch (name) {
    case 'barcode':
      return import(/* webpackChunkName: "barcode" */ '@kansa/client-barcode-module')
    case 'slack':
      return import(/* webpackChunkName: "slack" */ '@kansa/client-slack-module')
    default:
      return null
  }
}
