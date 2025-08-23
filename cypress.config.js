const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8002',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      return config
    }
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'mochawesome-report',
    overwrite: false,
    html: false,
    json: true,
    charts: true,
    reportPageTitle: 'Kong Automation Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false
  }
})