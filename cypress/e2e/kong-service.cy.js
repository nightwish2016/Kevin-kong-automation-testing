describe('Kong Service Automation', () => {
  before(() => {
    // 只在这个文件开始时删除所有的 service 和 route
    cy.visit('/workspaces')
    cy.cleanupKongEntities()
  })

  beforeEach(() => {
    cy.visit('/workspaces')
  })

  it('Add a new service to Kong', () => {
    // Navigate to default workspace
    cy.contains('default').click()
    
    // Navigate to Services section
    cy.contains('Services').click()
    
    // Click on New Gateway Service button
    cy.get('[data-testid="empty-state-action"]', { timeout: 10000 })
      .should('be.visible')
      .click()
    
    // Fill in service details
    cy.fixture('kong-data').then((data) => {
      const service = data.service
      
      // Service name
      cy.get('input[name="name"]')
        .should('be.visible')
        .clear()
        .type(service.name)
      
      // Service URL
      cy.get('input[name="url"]')
        .should('be.visible')
        .clear()
        .type(service.url)
      
      // cy.pause()
      // Optional: Add tags
      if (service.tags && service.tags.length > 0) {
        // First expand the tags section if it's collapsed
        cy.get('body').then(($body) => {
          // Look for collapse/expand button or section
          if ($body.find('button:contains("Tags"), .collapse-trigger, [data-testid*="collapse"], [data-testid*="expand"]').length > 0) {
            cy.get('button:contains("Tags"), .collapse-trigger, [data-testid*="collapse"], [data-testid*="expand"]')
              .first()
              .click()
          }
        })
        
        cy.get('input[name="tags"]')
          .clear({ force: true })
          .type(service.tags.join(','), { force: true })
      }
    })
    
    // Submit the form
    cy.get('button[type="submit"]')
      .contains('Save')
      .click()
    // cy.pause()
    
   
    
    // Verify service appears in the list
    cy.fixture('kong-data').then((data) => {
      cy.contains(data.service.name)
        .should('be.visible')
    })
  })

  it('Handle service creation with advanced options', () => {
    cy.navigateToDefaultWorkspace()
    cy.contains('Services').click()
    
    // Use flexible button selection logic
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="empty-state-action"]').length > 0) {
        cy.get('[data-testid="empty-state-action"]').click()
      } else if ($body.find('[data-testid="new-gateway-service"]').length > 0) {
        cy.get('[data-testid="new-gateway-service"]').click()
      } else if ($body.find('[data-testid*="new-service"]').length > 0) {
        cy.get('[data-testid*="new-service"]').first().click()
      } else if ($body.find(':contains("New gateway service")').length > 0) {
        cy.contains('New gateway service').click()
      } else {
        cy.get('button:contains("New"), a:contains("New"), button:contains("Add"), button:contains("Create")').first().click()
      }
    })
    
    cy.fixture('kong-data').then((data) => {
      const advancedService = data.advancedService
      
      // Basic info
      cy.get('input[name="name"]').clear().type(advancedService.name)
      cy.get('input[name="url"]').clear().type(advancedService.url)
      
      // Try to expand advanced options if available
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Advanced"), button:contains("Show advanced"), [data-testid*="advanced"], .advanced-toggle').length > 0) {
          cy.get('button:contains("Advanced"), button:contains("Show advanced"), [data-testid*="advanced"], .advanced-toggle')
            .first()
            .click()
          
          // Set retries if field exists
          cy.get('body').then(($body2) => {
            if ($body2.find('input[name="retries"]').length > 0 && advancedService.retries) {
              cy.get('input[name="retries"]').clear().type(advancedService.retries.toString())
            }
            
            // Set connect timeout if field exists
            if ($body2.find('input[name="connect_timeout"]').length > 0 && advancedService.connect_timeout) {
              cy.get('input[name="connect_timeout"]').clear().type(advancedService.connect_timeout.toString())
            }
            
            // Set read timeout if field exists
            if ($body2.find('input[name="read_timeout"]').length > 0 && advancedService.read_timeout) {
              cy.get('input[name="read_timeout"]').clear().type(advancedService.read_timeout.toString())
            }
            
            // Set write timeout if field exists
            if ($body2.find('input[name="write_timeout"]').length > 0 && advancedService.write_timeout) {
              cy.get('input[name="write_timeout"]').clear().type(advancedService.write_timeout.toString())
            }
          })
        } else {
          // If no advanced section found, just log and continue
          cy.log('No advanced options section found, continuing with basic configuration')
        }
      })
    })
    
    cy.get('button[type="submit"]').contains('Save').click()
    
    // Verify service appears in the list
    cy.fixture('kong-data').then((data) => {
      cy.contains(data.advancedService.name)
        .should('be.visible')
    })
  })
})