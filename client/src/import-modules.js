export default name => {
  switch (name) {
    case 'badge':
      return import(/* webpackChunkName: "badge" */ '@kansa/client-badge-module')
    case 'barcode':
      return import(/* webpackChunkName: "barcode" */ '@kansa/client-barcode-module')
    case 'slack':
      return import(/* webpackChunkName: "slack" */ '@kansa/client-slack-module')
    default:
      return null
  }
}
