require('dotenv').load()

const browser = require('./lib/browser')
const database = require('./lib/database')
const output = require('./lib/output')

browser.downloadAccountBalanceAndOperations()
  .then(account => {
    database.save(account);
    output.show(account);
  })

/*
require('dotenv').load()
const fs = require('fs')


const filePath = '/tmp/caisse-epargne.html'

downloadOperations = () => {

}

showOperations = () => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
    }
    const $ = cheerio.load(data);

    // show balance
    console.log('Balance:', );

    // show operations
    const operations = []
    $('table.msi-table tr.rowClick').each((i, row) => {
      operations.push([
        $(row).children().eq(0).text(),
        $(row).children().eq(1).text(),
        $(row).children().eq(2).text(),
        $(row).children().eq(3).text()
      ])

      let operation = {
        accountId: 1,
        date: $(row).children().eq(0).text(),
        name: $(row).children().eq(1).text(),
        amount: parseFloat(
          ($(row).children().eq(2).text() + $(row).children().eq(3).text())
          .replace(',', '.')
          .replace(' ', '')
          .replace('€', '')
          .trim())
      }

      knex('operation_downloaded')
        .select()
        .from('operation_downloaded')
        .where('date', operation.date)
        .andWhere('name', operation.name)
        .andWhere('amount', operation.amount)
        .then(rows => {
          if (rows.length === 0) {
            knex('operation_downloaded')
              .returning('id')
              .insert(operation)
              .then(ids => {})
          }
        })
    })

  })
}


downloadOperations().then(showOperations)
*/
