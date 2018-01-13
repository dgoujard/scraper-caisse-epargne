const {
  Builder,
  By,
  until
} = require('selenium-webdriver')
require('dotenv').load()

const driver = new Builder().forBrowser('chrome').build()
const getElement = (xpath) => driver.wait(until.elementLocated(By.xpath(xpath)))
const formatAmount = (amount) => amount.replace(',', '.').replace('+', '').replace('€', '').trim()

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
balanceElement.getText()
  .then(balance => {
    let account = {}
    account.balance = formatAmount(balance)
    account.operations = []
    console.log(account)
  })

driver.quit()
