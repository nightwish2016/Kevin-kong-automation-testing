// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // This is useful for Kong UI which might have some client-side errors
  console.log('Uncaught exception:', err.message)
  return false
})

// Global before hook
beforeEach(() => {
  // Set up any global state or configuration
  cy.intercept('GET', '**/api/**').as('apiCall')
  
  // Handle potential network issues
  cy.on('fail', (err, runnable) => {
    if (err.message.includes('ESOCKETTIMEDOUT') || 
        err.message.includes('ECONNREFUSED') ||
        err.message.includes('Network Error')) {
      throw new Error(`Kong server may not be running at http://localhost:8002. Please ensure Kong is started.`)
    }
    throw err
  })
})