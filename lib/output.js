const { table } = require('table')

module.exports.show = (accounts) => {
  for (let i = 0; i < accounts.length; i++) {
    let account = accounts[i]
    console.log(table([
      [account.name, account.balance]
    ]))

    const operations = []
    for (let i = 0; i < account.operations.length; i++) {
      let op = account.operations[i]
      operations.push([op.date, op.name, op.amount])
    }
    console.log(table(operations, {
      columns: {
        0: { alignment: 'left' },
        1: { alignment: 'left' },
        2: { alignment: 'right' }
      },
      drawHorizontalLine: (index, size) => index === 0 || index === size
    }))
  }
}

module.exports.log = (message) => {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  const s = now.getSeconds().toString().padStart(2, '0')
  const ms = now.getMilliseconds().toString().padStart(3, '0')

  console.log(`${h}:${m}:${s}.${ms}`, message)
}
