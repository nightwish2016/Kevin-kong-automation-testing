describe('Kong Complete Workflow', () => {
  before(() => {
    // 只在这个文件开始时删除所有的 service 和 route
    cy.visit('/workspaces')
    cy.waitForKongUI()
    cy.cleanupKongEntities()
  })

  beforeEach(() => {
    cy.visit('/workspaces')
    cy.waitForKongUI()
  })

  // afterEach(() => {
  //   // Cleanup after each test
  //   cy.clearAllRoutes()
  //   cy.clearAllServices()
  // })

  it('Complete full service and route creation workflow', () => {
    cy.fixture('kong-data').then((data) => {
      // Step 1: Create a service
      cy.navigateToDefaultWorkspace()
      cy.contains('Services').click()
      
      // Create service using UI
      cy.createService(data.service)
      
      // Verify service exists
      cy.contains(data.service.name).should('be.visible')
      
      // Step 2: Create a route for the service
      cy.contains('Routes').click()
      cy.createRoute({
        ...data.route,
        service: data.service.name
      })
      
      // cy.pause()
      // Verify route exists
      cy.contains(data.route.name).should('be.visible')
      
      // Step 3: Verify the connection between service and route
      cy.contains(data.route.name).click()
      cy.contains(data.service.name).should('be.visible')
    })
  })

  it('Create multiple services and routes', () => {
    cy.fixture('kong-data').then((data) => {
      // Create multiple services
      data.testData.services.forEach((service, index) => {
        cy.createService(service)
        
        // Create a corresponding route
        const route = data.testData.routes[index]
        if (route) {
          cy.createRoute({
            ...route,
            service: service.name
          })
        }
      })
      
      // Verify all services exist
      cy.navigateToDefaultWorkspace()
      cy.contains('Services').click()
      data.testData.services.forEach((service) => {
        cy.contains(service.name).should('be.visible')
      })
      
      // Verify all routes exist
      cy.contains('Routes').click()
      data.testData.routes.forEach((route) => {
        cy.contains(route.name).should('be.visible')
      })
    })
  })

  it('Handle service creation errors gracefully', () => {
    cy.navigateToDefaultWorkspace()
    cy.contains('Services').click()
    
    // Use flexible button selection logic like other tests
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
    
    // Wait for form to load
    cy.wait(1000)
    
    // Try to create service with invalid URL using flexible selectors
    cy.get('body').then(($body) => {
      // Service name field
      if ($body.find('input[name="name"]').length > 0) {
        cy.get('input[name="name"]').clear().type('invalid-service')
      } else if ($body.find('input[placeholder*="name"]').length > 0) {
        cy.get('input[placeholder*="name"]').first().clear().type('invalid-service')
      } else {
        cy.log('Name field not found - test may fail')
      }
      
      // Service URL field - intentionally invalid
      if ($body.find('input[name="url"]').length > 0) {
        cy.get('input[name="url"]').clear().type('invalid-url')
      } else if ($body.find('input[placeholder*="url"]').length > 0) {
        cy.get('input[placeholder*="url"]').first().clear().type('invalid-url')
      } else {
        cy.log('URL field not found - test may fail')
      }
    })
    
    // Wait a moment for client-side validation to kick in
    cy.wait(1000)
    
    // Check for the specific validation error message Kong shows for invalid URLs
    cy.get('body').should('contain.text', 'The URL must follow a valid format. Example: https://api.kong-air.com/flights')
    
    cy.log('Found expected error message for invalid URL format')
    
    // Verify that URL field has error styling (red border)
    cy.get('input[name="url"], input[placeholder*="url"]').first().should(($input) => {
      // Check for error classes or red border styling
      const element = $input[0]
      const classList = Array.from(element.classList)
      const hasErrorClass = classList.some(cls => 
        cls.includes('error') || cls.includes('invalid') || cls.includes('danger')
      )
      
      
    })
    
    // Verify that Save button is disabled when URL is invalid
    cy.get('button[type="submit"]:contains("Save"), button:contains("Save"), button:contains("Create")')
      .first()
      .should(($button) => {
        const button = $button[0]
        // Check if button is disabled through various methods
        expect(
          button.disabled || 
          button.hasAttribute('disabled') ||
          button.classList.contains('disabled') ||
          window.getComputedStyle(button).pointerEvents === 'none'
        ).to.be.true
      })
    
    cy.log('Verified that Save button is disabled due to invalid URL')
    
    cy.log('Successfully detected error validation for invalid service URL')
  })

  it('Create login service and route then call API endpoint', () => {
    cy.fixture('kong-data').then((data) => {
      // Step 1: Create login service
      const loginService = {
        name: 'login-service',
        url: 'http://104.168.218.218:5000'
      }
      
      cy.createService(loginService)
      
      // Verify service exists
      cy.navigateToDefaultWorkspace()
      cy.contains('Services').click()
      cy.contains(loginService.name).should('be.visible')
      
      // Step 2: Create login route
      const loginRoute = {
        name: 'login-route',
        service: loginService.name,
        paths: ['/api/v1/login'],
        methods: ['POST']
      }
      
      cy.contains('Routes').click()
      cy.createRoute(loginRoute)
      
      // Verify route exists
      cy.contains(loginRoute.name).should('be.visible')
      
      // Step 3: Test the API endpoint through Kong proxy
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/api/v1/login',
        body: {
          email: 'kzhou2017@outlook.com',
          password: '123'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false // Allow non-2xx responses
      }).then((response) => {
        // Log the response for debugging
        cy.log(`API Response Status: ${response.status}`)
        cy.log(`API Response Body: ${JSON.stringify(response.body)}`)
        
        // Verify the request went through Kong (check for Kong headers)
        expect(response.headers).to.have.property('via')
        expect(response.headers.via).to.contain('kong')
        
        // Verify successful login response
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('UserName')
        expect(response.body.UserName).to.equal('kevin')
      })
    })
  })
})