require('dotenv').load()

const browser = require('./lib/browser')
const database = require('./lib/database')
const output = require('./lib/output')

browser.downloadAccountBalanceAndOperations()
  .then(accounts => {
    database.save(accounts)
    output.show(accounts)
  })
