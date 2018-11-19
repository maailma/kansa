const fs = require('fs')
const path = require('path')
const Stripe = require('stripe')
const YAML = require('yaml')

const dcConfigPath = path.resolve(
  __dirname,
  '../config/docker-compose.dev.yaml'
)
const dcConfig = YAML.parse(fs.readFileSync(dcConfigPath, 'utf8'))
const { STRIPE_SECRET_APIKEY } = dcConfig.services.server.environment

module.exports = {
  stripe: Stripe(STRIPE_SECRET_APIKEY),
  card: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2020,
    cvc: '123'
  }
}
