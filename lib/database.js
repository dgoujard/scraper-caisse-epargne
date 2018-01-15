const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PWD,
    database: process.env.PG_DB
  }
})

module.exports.save = (account) => {
  if (process.env.PG_HOST != null) {
    const accountId = 1

    // save balance
    knex('account_downloaded')
      .returning('id')
      .insert({
        accountId: accountId,
        balance: account.balance
      }).then(ids => {
        // save operations
        let operationsSaved = 0
        let insertPromises = []
        for (let i = 0; i < account.operations.length; i++) {
          insertPromises.push(
            new Promise((resolve, reject) => {
              let operation = account.operations[i]
              knex('operation_downloaded')
                .select()
                .from('operation_downloaded')
                .where('date', operation.date)
                .andWhere('name', operation.name)
                .andWhere('amount', operation.amount)
                .andWhere('accountId', accountId)
                .then(rows => {
                  if (rows.length === 0) {
                    knex('operation_downloaded')
                      .returning('id')
                      .insert({
                        date: operation.date,
                        name: operation.name,
                        amount: operation.amount,
                        accountId: accountId
                      })
                      .then(ids => {
                        operationsSaved += ids.length
                        resolve()
                      })
                  } else {
                    resolve()
                  }
                })
            })
          )
        }
        Promise.all(insertPromises).then(() => {
          console.log(`${operationsSaved} new operation(s) saved in database.`)
          knex.destroy()
        })
      })
  }
}
