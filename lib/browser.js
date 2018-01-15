const cheerio = require('cheerio')
const { Builder, By, until } = require('selenium-webdriver')
const driver = new Builder()
  .forBrowser('chrome')
  .build()

exports.downloadAccountBalanceAndOperations = () => {
  return new Promise((resolve, reject) => {
    init().then(() => {
      signIn().then(() => {
        chooseAccount().then(() => {
          getOperations().then(account => {
            resolve(account)
          })
        })
      })
    })
  })
}

const getElement = xpath => driver.wait(until.elementLocated(By.xpath(xpath)))
const getAmountFromText = text => parseFloat(text.replace(',', '.').replace(' ', '').replace('€', '').trim())

const init = () => {
  return new Promise((resolve, reject) => {
    // get focus on browser
    driver.executeScript('alert("hello world !")')
      .then(() => {
        driver.switchTo().alert().accept()

        // launch page
        driver.get(process.env.URL)
          .then(() => resolve())
      })
  })
}

const signIn = () => {
  return new Promise((resolve, reject) => {

    // click on sign-in button
    const signInButton = getElement('//a[contains(@class, "icon-bpce-profil")]')
    signInButton.click()

    // login
    const loginInput = getElement('//form[contains(@class, "identification-form")]/input[@id="idClient"]')
    driver.wait(until.elementIsVisible(loginInput))
    const loginButton = getElement('//form[contains(@class, "identification-form")]/button[@type="submit"]')
    driver.wait(until.elementIsVisible(loginButton))
    loginInput.clear()
    loginInput.click()
    loginInput.sendKeys(process.env.LOGIN)
    loginButton.click()

    // password
    const secureKeyPad = getElement('//div[contains(@class, "type-password") and contains(@class, "in")]/form/div[contains(@class, "affClavierSecurise")]')
    driver.wait(until.elementIsVisible(secureKeyPad))
    driver.executeScript((args) => {
      document.getElementById('input_password_accessibility').parentElement.style.display = 'block'
      document.getElementById('codconfstar').parentElement.style.display = 'none'
      document.getElementById('input_password_accessibility').value = args
    }, process.env.PASSWORD)

    let passwordButton = getElement('//div[contains(@class, "type-password") and contains(@class, "in")]/form/div[contains(@class, "affClavierClassique")]/div/button[@type="submit"]')
    passwordButton.click()
      .then(() => resolve())
  })
}

const chooseAccount = () => {
  return new Promise((resolve, reject) => {
    const accountId = process.env.ACCOUNT_ID
    let accountLink = getElement('//td[contains(@class, "rowClick")]/a[contains(@title, "' + accountId + '")]/..')
    accountLink.click()
      .then(() => resolve())
  })
}

const getOperations = () => {
  return new Promise((resolve, reject) => {
    const balanceElement = getElement('//span[contains(@class, "bigFont")]')
    driver.wait(until.elementIsVisible(balanceElement))
    const mainElement = getElement('//div[@id = "MM_ContentMain"]')

    mainElement.getAttribute('innerHTML')
      .then(html => {
        driver.quit()
        const $ = cheerio.load(html)
        const account = {
          name: $('#MM_HISTORIQUE_COMPTE .bigDropDown .activeCustomDropdown .col1').text(),
          balance: getAmountFromText($('#MM_HISTORIQUE_COMPTE .somme .bigFont').text()),
          operations: []
        }

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
