const { table } = require('table')

module.exports.show = (account) => {
  console.log(table([
    [account.name, account.balance]
  ]));

  operations = [];
  for (let i = 0; i < account.operations.length; i++) {
    let op = account.operations[i]
    operations.push([op.date, op.name, op.amount])
  }
  console.log(table(operations, config = {
    columns: {
      0: { alignment: 'left' },
      1: { alignment: 'left' },
      2: { alignment: 'right' },
      3: { alignment: 'right' }
    },
    drawHorizontalLine: (index, size) => index === 0 || index === size
  }))
}
