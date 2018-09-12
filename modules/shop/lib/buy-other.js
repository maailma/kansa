const { sendMail } = require('@kansa/common/mail')
const Payment = require('./payment')

module.exports = function buyOther(db, ctx, req) {
  const { account, email, items, source } = req.body
  return new Payment(account, email, source, items)
    .process(ctx, db)
    .then(items =>
      Promise.all(
        items.map(item =>
          db
            .one(
              `
            SELECT f.fields AS shape, t.types
              FROM payment_fields_by_category f
                    LEFT JOIN payment_types_by_category t USING (key)
              WHERE key = $1`,
              item.category
            )
            .then(({ shape, types }) => {
              const typeData = types.find(td => td.key === item.type)
              return sendMail(
                'kansa-new-payment',
                Object.assign(
                  {
                    email: item.person_email || item.payment_email,
                    name: item.person_name || null,
                    mandate_url:
                      (source.sepa_debit && source.sepa_debit.mandate_url) ||
                      null,
                    shape,
                    typeLabel: (typeData && typeData.label) || item.type
                  },
                  item
                )
              )
            })
        )
      ).then(() => ({
        status: items[0].status,
        charge_id: items[0].stripe_receipt || items[0].stripe_charge_id
      }))
    )
}
