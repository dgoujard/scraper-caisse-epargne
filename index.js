const fs = require('fs')
const cheerio = require('cheerio')
const {
  table
} = require('table')

require('dotenv').load()

const filePath = '/tmp/caisse-epargne.html'

downloadOperations = () => {
  return new Promise((resolve, reject) => {
    const {
      Builder,
      By,
      until
    } = require('selenium-webdriver')

    const driver = new Builder().forBrowser('chrome').build()
    const getElement = (xpath) => driver.wait(until.elementLocated(By.xpath(xpath)))

    // get focus
    driver.executeScript('alert("hello world !")')
      .then(() => driver.switchTo().alert().accept())

    // launch page
    driver.get(process.env.URL)

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

    const accountId = process.env.ACCOUNT_ID
    let accountLink = getElement('//td[contains(@class, "rowClick")]/a[contains(@title, "' + accountId + '")]/..')
    accountLink.click()

    const balanceElement = getElement('//span[contains(@class, "bigFont")]')
    driver.wait(until.elementIsVisible(balanceElement))
    const mainElement = getElement('//div[@id = "MM_ContentMain"]')

    mainElement.getAttribute('innerHTML')
      .then(html => {
        fs.writeFile(filePath, html, err => {
          if (err) {
            console.log(err)
          }
          driver.quit()
          resolve()
        })
      })
  })
}

showOperations = () => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
    }
    const $ = cheerio.load(data);

    // show balance
    console.log('Balance:', $('#MM_HISTORIQUE_COMPTE .somme .bigFont').text());

    // show operations
    const operations = []
    $('table.msi-table tr.rowClick').each((i, row) => {
      operations.push([
        $(row).children().eq(0).text(),
        $(row).children().eq(1).text(),
        $(row).children().eq(2).text(),
        $(row).children().eq(3).text()
      ])
    })
    console.log(table(operations, config = {
      columns: {
        0: {
          alignment: 'left'
        },
        1: {
          alignment: 'left'
        },
        2: {
          alignment: 'right'
        },
        3: {
          alignment: 'right'
        }
      },
      drawHorizontalLine: (index, size) => index === 0 || index === size
    }))
  })
}


downloadOperations().then(showOperations)
