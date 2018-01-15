require('dotenv').load()

const browser = require('./lib/browser')
const database = require('./lib/database')
const output = require('./lib/output')

browser.downloadAccountBalanceAndOperations()
  .then(account => {
    database.save(account)
    output.show(account)
  })
