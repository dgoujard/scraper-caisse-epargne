const cheerio = require('cheerio')
const { Builder, By, until } = require('selenium-webdriver')
const output = require('../lib/output')

const driver = new Builder()
  .forBrowser('chrome')
  .build()

exports.downloadAccountBalanceAndOperations = () => {
  output.log('Downloading ...')
  return new Promise((resolve, reject) => {
    init().then(() => {
      signIn().then(() => {
        getAccounts().then(accounts => {
          driver.quit()
          resolve(accounts)
        })
      })
    })
  })
}

const getElement = xpath => {
  output.log(`Get element ${xpath}`)
  driver.wait(until.elementLocated(By.xpath(xpath)))
  return driver.wait(until.elementIsVisible(driver.findElement(By.xpath(xpath))))
}
const getAmountFromText = text => {
  return parseFloat(
    text.replace(/,/g, '.')
      .replace(/ /g, '')
      .replace(/\s/g, '')
      .replace(/&nbsp;/g, '')
      .replace(/€/g, '')
      .trim()
  )
}
const waitLoader = () => {
  output.log('Wait until loader is not visible')
  let xpath = `//div[contains(@class, "loaderServeur")]`
  driver.wait(until.elementLocated(By.xpath(xpath)))
  driver.wait(() => {
    return until.elementIsNotVisible(driver.findElement(By.xpath(xpath)))
  }, 3000)
  return null
}

const init = () => {
  return new Promise((resolve, reject) => {
    // get focus on browser
    output.log('Get focus on browser')
    driver.executeScript('alert("hello world !")')
      .then(() => {
        driver.switchTo().alert().accept()

        // launch page
        output.log('launch page')
        driver.get(process.env.URL)
          .then(() => resolve())
      })
  })
}

const signIn = () => {
  return new Promise((resolve, reject) => {
    // click on sign-in button
    output.log('Click on sign-in button')
    const signInButton = getElement('//a[contains(@class, "icon-bpce-profil")]')
    signInButton.click()

    // login
    output.log('login')
    const loginInput = getElement('//form[contains(@class, "identification-form")]/input[@id="idClient"]')
    driver.wait(until.elementIsVisible(loginInput))
    const loginButton = getElement('//form[contains(@class, "identification-form")]/button[@type="submit"]')
    driver.wait(until.elementIsVisible(loginButton))
    loginInput.clear()
    loginInput.click()
    loginInput.sendKeys(process.env.LOGIN)
    loginButton.click()

    // password
    output.log('password')
    const secureKeyPad = getElement('//div[contains(@class, "type-password") and contains(@class, "in")]/form/div[contains(@class, "affClavierSecurise")]')
    driver.wait(until.elementIsVisible(secureKeyPad))

    // show accessibility keyboard
    output.log('show accessibility keyboard')
    driver.executeScript((args) => {
      document.getElementById('input_password_accessibility').parentElement.style.display = 'block'
      document.getElementById('codconfstar').parentElement.style.display = 'none'
      document.getElementById('input_password_accessibility').value = args
    }, process.env.PASSWORD)

    // click connection button
    output.log('click connection button')
    let passwordButton = getElement('//div[contains(@class, "type-password") and contains(@class, "in")]/form/div[contains(@class, "affClavierClassique")]/div/button[@type="submit"]')
    passwordButton.click()
      .then(() => {
        // click "Mes comptes" menu link
        output.log('click "Mes comptes" menu link')
        let accountsLink = getElement(`//a[contains(@href, "CPTSYNT1")]`)
        accountsLink.click()
          .then(() => {
            waitLoader()
            getElement(`//span[@id = "MM_SYNTHESE_COMPTES"]`)
            resolve()
          })
      })
  })
}

const getAccounts = () => {
  return new Promise((resolve, reject) => {
    const accounts = []
    let accountsArray = process.env.ACCOUNT_IDS.split('|')
    for (let i = 0; i < accountsArray.length; i++) {
      let account = accountsArray[i].split(':')
      accounts.push({
        bankId: parseInt(account[0]),
        internalId: parseInt(account[1])
      })
    }
    getAccount(accounts)
      .then(resolve)
  })
}

const getAccount = (accounts) => {
  return new Promise((resolve, reject) => {
    let result = []
    let account = accounts.pop()
    chooseAccount(account)
      .then(() => {
        getAccountAndOperations(account)
          .then(account => {
            result.push(account)
            if (accounts.length > 0) {
              getAccount(accounts)
                .then(subResult => {
                  result = result.concat(subResult)
                  resolve(result)
                })
            } else {
              resolve(result)
            }
          })
      })
  })
}

const chooseAccount = (account) => {
  return new Promise((resolve, reject) => {
    // click "Ma Synthèse" menu link
    output.log('click "Ma Synthèse" menu link')
    let syntheseLink = getElement(`//a[contains(@href, "CPTSYNT0")]`)
    driver.wait(until.elementIsVisible(syntheseLink))
    syntheseLink.click()
      .then(() => {
        waitLoader()

        // click account link
        output.log(`click account link ${account.bankId}`)
        let accountLink = getElement(`//td[contains(@class, "rowClick")]/a[contains(@title, "${account.bankId}")]/..`)
        driver.wait(until.elementIsVisible(accountLink))
        accountLink.click()
          .then(() => resolve())
      })
  })
}

const getAccountAndOperations = (account) => {
  return new Promise((resolve, reject) => {
    const balanceElement = getElement('//span[contains(@class, "bigFont")]')
    driver.wait(until.elementIsVisible(balanceElement))

    const mainElement = getElement('//div[@id = "MM_ContentMain"]')
    mainElement.getAttribute('innerHTML')
      .then(html => {
        const $ = cheerio.load(html)
        account.name = $('#MM_HISTORIQUE_COMPTE .bigDropDown .activeCustomDropdown .col1').text()
        account.balance = getAmountFromText($('#MM_HISTORIQUE_COMPTE .somme .bigFont').text())
        account.operations = []

        $('table.msi-table tr.rowClick').each((i, row) => {
          account.operations.push({
            date: $(row).children().eq(0).text(),
            name: $(row).children().eq(1).text(),
            amount: getAmountFromText($(row).children().eq(2).text() + $(row).children().eq(3).text())
          })
        })
        resolve(account)
      })
  })
}
