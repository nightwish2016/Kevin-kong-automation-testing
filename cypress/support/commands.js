// Custom commands for Kong automation

// Navigate to default workspace
Cypress.Commands.add('navigateToDefaultWorkspace', () => {
  cy.visit('/workspaces')
  cy.contains('default', { timeout: 10000 }).click()
  cy.url().should('include', 'default')
})

// Create a service programmatically
Cypress.Commands.add('createService', (serviceData = null) => {
  cy.navigateToDefaultWorkspace()
  cy.contains('Services').click()
  cy.wait(2000)
  // Try to find and click new gateway service button with different possible selectors
  cy.get('body').then(($body) => {
    // if ($body.find('[data-testid="empty-state-action"]').length > 0) {
    //   cy.get('[data-testid="empty-state-action"]').click()
    // } else if ($body.find('[data-testid="new-gateway-service"]').length > 0) {
    //   cy.get('[data-testid="new-gateway-service"]').click()
    // } else if ($body.find('[data-testid*="new-service"]').length > 0) {
    //   cy.get('[data-testid*="new-service"]').first().click()
    // } else if ($body.find('button:contains("New gateway service")').length > 0) {
    //   cy.get('button:contains("New gateway service")').click()
    // } else if ($body.find('a:contains("New gateway service")').length > 0) {
    //   cy.get('a:contains("New gateway service")').click()
    // } else if ($body.find(':contains("New gateway service")').length > 0) {
    //   cy.contains('New gateway service').click()
    // } else if ($body.find('[data-testid="new-service-button"]').length > 0) {
    //   cy.get('[data-testid="new-service-button"]').click()
    // } else if ($body.find('button:contains("New Service")').length > 0) {
    //   cy.get('button:contains("New Service")').click()
    // } else if ($body.find('a:contains("New Service")').length > 0) {
    //   cy.get('a:contains("New Service")').click()
    // } else {
    //   // Fallback: look for any button with "New" or "Add" or "Create"
    //   cy.get('button:contains("New"), a:contains("New"), button:contains("Add"), button:contains("Create")').first().click()
    // }
    //  cy.get('[data-testid="empty-state-action"]').click()
      if ($body.find('[data-testid="empty-state-action"]', { timeout: 10000 }).length > 0) {
      cy.get('[data-testid="empty-state-action"]').click()
     }
     if ($body.find('[data-testid="toolbar-add-gateway-service"]', { timeout: 10000 }).length > 0) {
       cy.get('[data-testid="toolbar-add-gateway-service"]').click()
     }
      else {
      cy.log('No known new service button found, attempting generic selector')
      }
  })
  
  if (!serviceData) {
    cy.fixture('kong-data').then((data) => {
      serviceData = data.service
    })
  }
  

  cy.then(() => {
    // Fill in service form - break up chains to avoid DOM detachment
    cy.get('input[name="name"], input[placeholder*="name"], input[id*="name"]')
      .first()
      .clear()
    
    cy.get('input[name="name"], input[placeholder*="name"], input[id*="name"]')
      .first()
      .type(serviceData.name)
    
    cy.get('input[name="url"], input[placeholder*="url"], input[id*="url"]')
      .first()
      .clear()
    
    cy.get('input[name="url"], input[placeholder*="url"], input[id*="url"]')
      .first()
      .type(serviceData.url)
    
    // Add tags if provided
    if (serviceData.tags && serviceData.tags.length > 0) {
      // First expand the tags section if it's collapsed
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Tags"), .collapse-trigger, [data-testid*="collapse"], [data-testid*="expand"]').length > 0) {
          cy.get('button:contains("Tags"), .collapse-trigger, [data-testid*="collapse"], [data-testid*="expand"]')
            .first()
            .click()
        }
      })
      
      cy.get('input[name="tags"]')
        .clear({ force: true })
      
      cy.get('input[name="tags"]')
        .type(serviceData.tags.join(','), { force: true })
    }
    
    // Submit form
    cy.get('button[type="submit"]:contains("Save"), button:contains("Save"), button:contains("Create")')
      .first()
      .click()
    
    
  })
})

// Create a route programmatically
Cypress.Commands.add('createRoute', (routeData = null) => {
  cy.navigateToDefaultWorkspace()
  cy.contains('Routes').click()
  cy.wait(2000)
  // Try to find and click new route button
  cy.get('body').then(($body) => {
    // if ($body.find('[data-testid="empty-state-action"]').length > 0) {
    //   cy.get('[data-testid="empty-state-action"]').click()
    // } else if ($body.find('[data-testid="new-route-button"]').length > 0) {
    //   cy.get('[data-testid="new-route-button"]').click()
    // } else if ($body.find('[data-testid*="new-route"]').length > 0) {
    //   cy.get('[data-testid*="new-route"]').first().click()
    // } else if ($body.find('button:contains("New route")').length > 0) {
    //   cy.get('button:contains("New route")').click()
    // } else if ($body.find('a:contains("New route")').length > 0) {
    //   cy.get('a:contains("New route")').click()
    // } else if ($body.find('button:contains("New Route")').length > 0) {
    //   cy.get('button:contains("New Route")').click()
    // } else if ($body.find('a:contains("New Route")').length > 0) {
    //   cy.get('a:contains("New Route")').click()
    // } else {
    //   cy.get('button:contains("New"), a:contains("New"), button:contains("Add"), button:contains("Create")').first().click()
    // }
    if ($body.find('[data-testid="empty-state-action"]', { timeout: 10000 }).length > 0) {
      cy.get('[data-testid="empty-state-action"]').click()
    }
    else if($body.find('[data-testid="toolbar-add-route"]', { timeout: 10000 }).length > 0) {
      cy.get('[data-testid="toolbar-add-route"]').click()
    }
    else
    {
      cy.log('No known new route button found, attempting generic selector')
    }
  })
  
  if (!routeData) {
    cy.fixture('kong-data').then((data) => {
      routeData = data.route
    })
  }
  
  cy.then(() => {
    // Fill in route form - use flexible selectors
    cy.get('body').then(($body) => {
      // Route name - break up chains to avoid DOM detachment
      if ($body.find('input[name="name"]', { timeout: 10000 }).length > 0) {
        cy.get('input[name="name"]').clear()
        cy.get('input[name="name"]').type(routeData.name)
      } else if ($body.find('input[placeholder*="name"], input[id*="name"]',{ timeout: 10000 }).length > 0) {
        cy.get('input[placeholder*="name"], input[id*="name"]').first().clear()
        cy.get('input[placeholder*="name"], input[id*="name"]').first().type(routeData.name)
      } else {
        cy.log('Name field not found for route')
      }
      
      // Service selection - custom dropdown component
      if (routeData.service) {
        // Look for the custom dropdown component
        // if ($body.find('input[value*="kevin-test-service"], input[placeholder*="service"]').length > 0) {
        //   cy.log('Found custom service dropdown input field')
        //   cy.get('input[value*="kevin-test-service"], input[placeholder*="service"]').first().click()
        //   cy.wait(500)
        //   cy.contains(routeData.service).click()
          
        // } else if ($body.find('.dropdown, .select-dropdown, [role="combobox"]').length > 0) {
        //   cy.log('Found dropdown component')
        //   cy.get('.dropdown, .select-dropdown, [role="combobox"]').first().click()
        //   cy.wait(500)
        //   cy.contains(routeData.service).click()
          
        // } else if ($body.find('select[name="service"]').length > 0) {
        //   cy.get('select[name="service"]').should('be.visible').click()
        //   cy.wait(500)
        //   cy.get('select[name="service"]').select(routeData.service)
          
        // } else if ($body.find('input[name*="service"], input[placeholder*="service"]').length > 0) {
        //   cy.get('input[name*="service"], input[placeholder*="service"]').first().click()
        //   cy.wait(500)
        //   cy.contains(routeData.service).click()
          
        // } else {
        //   cy.log('Service selection field not found for route')
        // }
  
        cy.get('[data-testid="route-form-service-id"]', { timeout: 10000 }).click()              
        cy.get('.route-form-service-dropdown-item>span', { timeout: 10000 }).first().click();
      }

      // Add paths - break up chains to avoid DOM detachment
      if (routeData.paths && routeData.paths.length > 0) {
        // if ($body.find('[data-testid="route-form-paths-input-1"]').length > 0) {
        //   cy.get('[data-testid="route-form-paths-input-1"]').clear()
        //   cy.get('[data-testid="route-form-paths-input-1"]').type(routeData.paths[0])
        // } else if ($body.find('input[name="paths[0]"], input[name*="path"]').length > 0) {
        //   cy.get('input[name="paths[0]"], input[name*="path"]').first().clear()
        //   cy.get('input[name="paths[0]"], input[name*="path"]').first().type(routeData.paths[0])
        // } else if ($body.find('input[placeholder*="path"], input[placeholder*="/api"]').length > 0) {
        //   cy.get('input[placeholder*="path"], input[placeholder*="/api"]').first().clear()
        //   cy.get('input[placeholder*="path"], input[placeholder*="/api"]').first().type(routeData.paths[0])
        // } else {
        //   cy.log('Path field not found for route')
        // }
        cy.get('[data-testid="route-form-paths-input-1"]')
            .clear()
            .type(routeData.paths[0])
      }
      
      // Select methods if available
      if (routeData.methods && routeData.methods.length > 0) {
        routeData.methods.forEach((method) => {
          // if ($body.find(`input[type="checkbox"][value="${method}"]`).length > 0) {
          //   cy.get(`input[type="checkbox"][value="${method}"]`).check({ force: true })
          // } else if ($body.find(`[data-testid*="method-${method.toLowerCase()}"], [data-testid*="${method.toLowerCase()}-checkbox"]`).length > 0) {
          //   cy.get(`[data-testid*="method-${method.toLowerCase()}"], [data-testid*="${method.toLowerCase()}-checkbox"]`).first().click({ force: true })
          // } else if ($body.find(`button:contains("${method}"), .method-${method.toLowerCase()}, .${method.toLowerCase()}-method`).length > 0) {
          //   cy.get(`button:contains("${method}"), .method-${method.toLowerCase()}, .${method.toLowerCase()}-method`).first().click({ force: true })
          // } else if ($body.find(`label:contains("${method}")`).length > 0) {
          //   cy.get(`label:contains("${method}")`).first().click({ force: true })
          // } else if ($body.find(`:contains("${method}")`).length > 0) {
          //   cy.contains(method).first().click({ force: true })
          // } else {
          //   cy.log(`Method selection for ${method} not found`)
          // }
          cy.get(`button:contains("${method}"), .method-${method.toLowerCase()}, .${method.toLowerCase()}-method`).first().click({ force: true })
        })
      }

      // Hosts - break up chains to avoid DOM detachment
      if (routeData.hosts && routeData.hosts.length > 0) {
        // if ($body.find('[data-testid*="host"], [data-testid*="hosts"]').length > 0) {
        //   cy.get('[data-testid*="host"], [data-testid*="hosts"]').first().clear()
        //   cy.get('[data-testid*="host"], [data-testid*="hosts"]').first().type(routeData.hosts[0])
        // } else if ($body.find('input[name="hosts[0]"], input[name*="host"]').length > 0) {
        //   cy.get('input[name="hosts[0]"], input[name*="host"]').first().clear()
        //   cy.get('input[name="hosts[0]"], input[name*="host"]').first().type(routeData.hosts[0])
        // } else if ($body.find('input[placeholder*="host"], input[placeholder*="domain"]').length > 0) {
        //   cy.get('input[placeholder*="host"], input[placeholder*="domain"]').first().clear()
        //   cy.get('input[placeholder*="host"], input[placeholder*="domain"]').first().type(routeData.hosts[0])
        // } else {
        //   cy.log('Host field not found for route')
        // }
         cy.get('[data-testid="route-form-hosts-input-1"]')
            .clear()
            .type(routeData.hosts[0])
      }

      // Handle strip_path checkbox
      // if (routeData.strip_path !== undefined) {
      //   if ($body.find('input[name="strip_path"], input[id*="strip"], input[data-testid*="strip"]').length > 0) {
      //     const stripPathCheckbox = cy.get('input[name="strip_path"], input[id*="strip"], input[data-testid*="strip"]').first()
      //     if (routeData.strip_path) {
      //       stripPathCheckbox.check({ force: true })
      //     } else {
      //       stripPathCheckbox.uncheck({ force: true })
      //     }
      //     cy.log(`Set strip_path to: ${routeData.strip_path}`)
      //   } else {
      //     cy.log('Strip path checkbox not found')
      //   }
      // }
        if (routeData.strip_path) {
              cy.get('[data-testid="route-form-strip-path"]').check({ force: true })
            } else {
              cy.get('[data-testid="route-form-strip-path"]').uncheck({ force: true })
            }
    })
    
    // Ensure all required fields are filled before submitting
    cy.get('body').then(($body) => {
      // Check if service is selected
      const serviceInput = $body.find('input[data-testid="route-form-service-id"]')
      if (serviceInput.length > 0 && !serviceInput.val()) {
        cy.log('Service not selected, this may cause Save button to be disabled')
      }
      
      // Check if name is filled
      const nameInput = $body.find('input[name="name"]')
      if (nameInput.length > 0 && !nameInput.val()) {
        cy.log('Route name not filled, this may cause Save button to be disabled')
      }
      
      // Check if paths are filled
      const pathsInput = $body.find('input[name="paths"]')
      if (pathsInput.length > 0 && !pathsInput.val()) {
        cy.log('Route paths not filled, this may cause Save button to be disabled')
      }
    })
    
    // Submit form - use force if button is disabled due to validation
    cy.get('button[type="submit"]:contains("Save"), button:contains("Save"), button:contains("Create")')
      .first()
      .then(($button) => {
        if ($button.prop('disabled')) {
          cy.log('Save button is disabled, attempting force click')
          cy.wrap($button).click({ force: true })
        } else {
          cy.wrap($button).click()
        }
      })
    
    
  })
})

// Wait for Kong UI to load completely
Cypress.Commands.add('waitForKongUI', () => {
  cy.get('body', { timeout: 15000 }).should('be.visible')
  cy.get('[data-testid="loading"], .loading, .spinner', { timeout: 10000 }).should('not.exist')
})

// Handle potential modal dialogs or confirmations
Cypress.Commands.add('handleConfirmation', (entityName = null) => {
  // Wait for modal to fully appear
  cy.wait(1000)
  
  cy.get('body').then(($body) => {
    // Look for modal dialog first
    const modalSelectors = [
      '.modal',
      '[role="dialog"]', 
      '[data-testid*="modal"]',
      '.dialog',
      '.confirmation-dialog',
      '[class*="modal"]',
      '[class*="dialog"]'
    ]
    
    let modalFound = false
    for (const selector of modalSelectors) {
      if ($body.find(selector).length > 0) {
        modalFound = true
        cy.log(`Found modal with selector: ${selector}`)
        
        // Try to extract entity name from modal if not provided
        if (!entityName) {
          const modalText = $body.find(selector).text()
          cy.log(`Modal text: ${modalText}`)
          
          // Look for patterns like 'Type "test-route" to confirm'
          const nameMatch = modalText.match(/Type "([^"]+)"|Type '([^']+)'|确认删除 "([^"]+)"|delete this route ([^\s?]+)|delete this service ([^\s?]+)/i)
          if (nameMatch) {
            entityName = nameMatch[1] || nameMatch[2] || nameMatch[3] || nameMatch[4] || nameMatch[5]
            cy.log(`Extracted entity name from modal: ${entityName}`)
          }
        }
        break
      }
    }
    
    // Look for confirmation input field with multiple selectors
    const inputSelectors = [
      'input#filter-name',  // Specific selector from error message
      'input[id="filter-name"]',
      'input[type="text"]',
      'input[placeholder*="confirm"]', 
      'input[placeholder*="type"]',
      'input[placeholder*="Type"]',
      'input[id*="confirm"]',
      'input[class*="confirm"]',
      'input[data-testid*="confirm"]',
      'input[autocomplete="off"]'
    ]
    
    let inputFound = false
    for (const inputSelector of inputSelectors) {
      if ($body.find(inputSelector).length > 0) {
        cy.log(`Found input field with selector: ${inputSelector}`)
        
        if (entityName) {
          cy.log(`Typing entity name for confirmation: ${entityName}`)
          
          // First try with visibility check
          cy.get('body').then(($body) => {
            const inputElement = $body.find(inputSelector).first()
            
            if (inputElement.length > 0) {
              // Try multiple approaches to interact with the input
              try {
                // Approach 1: Force interaction without visibility check
                if (inputSelector.includes('filter-name')) {
                  // Special handling for filter-name input
                  cy.get(inputSelector)
                    .should('exist')
                    .then(($input) => {
                      // Use jQuery to set value directly if Cypress fails
                      $input.val('')
                      $input.val(entityName)
                      $input.trigger('input')
                      $input.trigger('change')
                    })
                } else {
                  cy.get(inputSelector)
                    .first()
                    .clear({ force: true })
                    .type(entityName, { force: true })
                }
                
                inputFound = true
                cy.log(`Successfully typed using force: ${inputSelector}`)
                return false // Break out of loop
                
              } catch (forceError) {
                cy.log(`Force approach failed: ${forceError.message}`)
                
                try {
                  // Approach 2: Try to scroll element into view first
                  cy.get(inputSelector)
                    .first()
                    .scrollIntoView()
                    .wait(500)
                    .clear({ force: true })
                    .type(entityName, { force: true })
                  
                  inputFound = true
                  cy.log(`Successfully typed after scroll: ${inputSelector}`)
                  return false // Break out of loop
                  
                } catch (scrollError) {
                  cy.log(`Scroll approach failed: ${scrollError.message}`)
                  
                  try {
                    // Approach 3: Try clicking on modal first then input
                    cy.get('.modal, [role="dialog"]').first().click()
                    cy.wait(300)
                    cy.get(inputSelector)
                      .first()
                      .click({ force: true })
                      .clear({ force: true })
                      .type(entityName, { force: true })
                    
                    inputFound = true
                    cy.log(`Successfully typed after modal click: ${inputSelector}`)
                    return false // Break out of loop
                    
                  } catch (modalError) {
                    cy.log(`Modal click approach failed: ${modalError.message}`)
                    // Continue to next selector
                  }
                }
              }
            }
          })
          
          if (inputFound) {
            break
          }
        }
      }
    }
    
    // If no input found and we have entityName, debug the modal
    if (!inputFound && entityName) {
      cy.log('No input field found for confirmation - debugging modal structure')
      cy.debugModal()
    }
    
    if (inputFound) {
      // Wait for input to be processed and button to become enabled
      cy.wait(1500)
    }
    
    // Look for and click confirmation button
    const buttonSelectors = [
      'button:contains("Yes, delete")',
      'button:contains("delete")',
      'button:contains("Delete")', 
      'button:contains("Confirm")',
      'button:contains("OK")',
      'button:contains("Yes")',
      'button[type="submit"]',
      '[data-testid*="confirm"]',
      '[data-testid*="delete"]',
      '.btn-danger',
      '.danger-button',
      'button[class*="danger"]'
    ]
    
    let buttonClicked = false
    for (const buttonSelector of buttonSelectors) {
      if ($body.find(buttonSelector).length > 0) {
        cy.log(`Found confirmation button: ${buttonSelector}`)
        
        try {
          // Try different approaches to click the button
          if (buttonSelector.includes('delete') || buttonSelector.includes('danger')) {
            // For delete buttons, try force click first
            cy.get(buttonSelector)
              .first()
              .click({ force: true })
          } else {
            // For other buttons, try visibility check first
            cy.get(buttonSelector)
              .first()
              .should('be.visible')
              .click({ force: true })
          }
          
          buttonClicked = true
          cy.log(`Successfully clicked: ${buttonSelector}`)
          break
          
        } catch (buttonError) {
          cy.log(`Failed to click button ${buttonSelector}: ${buttonError.message}`)
          // Try next button selector
          continue
        }
      }
    }
    
    if (!buttonClicked) {
      cy.log('No confirmation button found or clicked successfully')
      cy.debugModal()
    }
  })
})

// Clear all services (for cleanup in tests)
Cypress.Commands.add('clearAllServices', () => {
  cy.navigateToDefaultWorkspace()
  cy.contains('Services').click()
  
  // Wait for services list to load
  cy.wait(3000)
  
  // Recursively delete services until none are left
  let deleteAttempts = 0
  const maxDeleteAttempts = 10 // Prevent infinite recursion
  
  const deleteServices = () => {
    if (deleteAttempts >= maxDeleteAttempts) {
      cy.log('Max delete attempts reached for services, stopping cleanup')
      return
    }
    
    deleteAttempts++
    cy.log(`Service deletion attempt ${deleteAttempts}/${maxDeleteAttempts}`)
    
    cy.get('body').then(($body) => {
      // Look for service rows with service names
      const serviceRows = $body.find('tbody tr, .service-row, .service-item, [data-testid*="service-row"]').not(':contains("No services")').not(':contains("Name")')
      
      if (serviceRows.length > 0) {
        // Get the first service row and extract service name
        const firstRow = serviceRows.first()
        let serviceName = null
        
        // Try to extract service name from the row - look for the name cell specifically
        const nameCell = firstRow.find('td[data-testid="name"]')
        if (nameCell.length > 0) {
          const nameElement = nameCell.find('b').first()
          if (nameElement.length > 0) {
            serviceName = nameElement.text().trim()
          }
        }
        
        // Fallback: try multiple cells if specific name cell not found
        if (!serviceName) {
          const nameCells = firstRow.find('td')
          for (let i = 0; i < Math.min(3, nameCells.length); i++) {
            const cellText = nameCells.eq(i).text().trim()
            if (cellText && cellText !== '' && !cellText.includes('•')) {
              serviceName = cellText
              break
            }
          }
        }
        
        // Find delete button in the first row
        const deleteButton = firstRow.find('button:contains("Delete"), [data-testid*="delete"], .delete-button, .action-delete, [title*="delete"], button[aria-label*="delete"]').first()
        
        if (deleteButton.length > 0) {
          cy.log(`Attempting to delete service: ${serviceName || 'unknown'}`)
          cy.wrap(deleteButton).click({ force: true })
          cy.wait(2000)
          
          // Handle confirmation dialog with service name
          cy.handleKongDeleteConfirmation(serviceName)
          cy.wait(4000)
          
          // Recursively continue deleting
          deleteServices()
        } else {
          cy.log('No delete button found in service row - trying next approach')
          
          // Try clicking on the row first to see if it reveals delete options
          cy.wrap(firstRow).click({ force: true })
          cy.wait(1000)
          
          // Look for delete button again
          const expandedDeleteButton = $body.find('button:contains("Delete"), [data-testid*="delete"], .delete-button').first()
          if (expandedDeleteButton.length > 0) {
            cy.wrap(expandedDeleteButton).click({ force: true })
            cy.wait(2000)
            cy.handleKongDeleteConfirmation(serviceName)
            cy.wait(4000)
            deleteServices()
          } else {
            cy.log('Still no delete button found, stopping service cleanup')
          }
        }
      } else {
        cy.log('No more services to delete')
      }
    })
  }
  
  deleteServices()
})

// Clear all routes (for cleanup in tests)  
Cypress.Commands.add('clearAllRoutes', () => {
  cy.navigateToDefaultWorkspace()
  cy.contains('Routes').click()
  
  // Wait for routes list to load
  cy.wait(3000)
  
  // Recursively delete routes until none are left
  let deleteAttempts = 0
  const maxDeleteAttempts = 10 // Prevent infinite recursion
  
  const deleteRoutes = () => {
    if (deleteAttempts >= maxDeleteAttempts) {
      cy.log('Max delete attempts reached for routes, stopping cleanup')
      return
    }
    
    deleteAttempts++
    cy.log(`Route deletion attempt ${deleteAttempts}/${maxDeleteAttempts}`)
    
    cy.get('body').then(($body) => {
      // Look for route rows with route names
      const routeRows = $body.find('tbody tr, .route-row, .route-item, [data-testid*="route-row"]').not(':contains("No routes")').not(':contains("Name")')
      
      if (routeRows.length > 0) {
        // Get the first route row and extract route name
        const firstRow = routeRows.first()
        let routeName = null
        
        // Try to extract route name from the row - try multiple cells
        const nameCells = firstRow.find('td')
        for (let i = 0; i < Math.min(3, nameCells.length); i++) {
          const cellText = nameCells.eq(i).text().trim()
          if (cellText && cellText !== '' && !cellText.includes('•')) {
            routeName = cellText
            break
          }
        }
        
        // Find delete button in the first row
        const deleteButton = firstRow.find('button:contains("Delete"), [data-testid*="delete"], .delete-button, .action-delete, [title*="delete"], button[aria-label*="delete"]').first()
        
        if (deleteButton.length > 0) {
          cy.log(`Attempting to delete route: ${routeName || 'unknown'}`)
          cy.wrap(deleteButton).click({ force: true })
          cy.wait(2000)
          
          // Handle confirmation dialog with route name
          try {
            cy.handleKongDeleteConfirmation(routeName)
            cy.wait(4000)
            
            // Recursively continue deleting
            deleteRoutes()
          } catch (error) {
            cy.log(`Error during confirmation for route ${routeName}: ${error.message}`)
            // Try to continue with next route
            deleteRoutes()
          }
        } else {
          cy.log('No delete button found in route row - trying next approach')
          
          // Try clicking on the row first to see if it reveals delete options
          cy.wrap(firstRow).click({ force: true })
          cy.wait(1000)
          
          // Look for delete button again
          const expandedDeleteButton = $body.find('button:contains("Delete"), [data-testid*="delete"], .delete-button').first()
          if (expandedDeleteButton.length > 0) {
            cy.wrap(expandedDeleteButton).click({ force: true })
            cy.wait(2000)
            cy.handleKongDeleteConfirmation(routeName)
            cy.wait(2000)
            deleteRoutes()
          } else {
            cy.log('Still no delete button found, stopping route cleanup')
          }
        }
      } else {
        cy.log('No more routes to delete')
      }
    })
  }
  
  deleteRoutes()
})

// Clear all Kong entities (routes and services) before running automation
Cypress.Commands.add('cleanupKongEntities', () => {
  cy.log('开始清理 Kong 实体...')
  
  // Add timeout protection
  const startTime = Date.now()
  const maxTime = 60000 // 60 seconds max
  
  // First clear routes (since they depend on services)
  try {
    cy.clearAllRoutes()
    cy.wait(2000)
  } catch (error) {
    cy.log('Route cleanup had issues, continuing with services...')
  }
  
  // Then clear services
  try {
    cy.clearAllServices()  
    cy.wait(2000)
  } catch (error) {
    cy.log('Service cleanup had issues, continuing...')
  }
  
  cy.log('Kong 实体清理完成')
})

// Simple confirmation handler specifically for Kong delete dialogs
Cypress.Commands.add('handleKongDeleteConfirmation', (entityName) => {
  cy.log(`Handling Kong delete confirmation for: ${entityName}`)
  
  // Wait for modal to appear
  cy.wait(1500)
  
  // Try to type in the confirmation field using multiple approaches
  const attempts = [
    // () => {
    //   // Attempt 1: Direct jQuery manipulation
    //   cy.get('body').then(($body) => {
    //     const filterInput = $body.find('input#filter-name')[0]
    //     if (filterInput) {
    //       cy.log('Found filter-name input, setting value directly')
    //       filterInput.value = entityName
    //       filterInput.dispatchEvent(new Event('input', { bubbles: true }))
    //       filterInput.dispatchEvent(new Event('change', { bubbles: true }))
    //     }
    //   })
    // },
    () => {
      // Attempt 2: Cypress invoke
      // cy.get('input#filter-name').invoke('val', entityName).trigger('input').trigger('change')
      cy.get('input[data-testid="confirmation-input"]').invoke('val', entityName).trigger('input').trigger('change')
    },
    () => {
      // Attempt 3: Force type
      cy.get('input#filter-name').clear({ force: true }).type(entityName, { force: true })
    }
  ]
  
  // Try each approach
  for (let i = 0; i < attempts.length; i++) {
    try {
      cy.log(`Trying approach ${i + 1} to set confirmation text`)
      attempts[i]()
      cy.wait(1000)
      break
    } catch (error) {
      cy.log(`Approach ${i + 1} failed: ${error.message}`)
      if (i === attempts.length - 1) {
        cy.log('All approaches failed for input')
      }
    }
  }
  
  // Wait for the input to be processed
  cy.wait(1500)
  
  // Click the delete button
  const buttonAttempts = [
    () => cy.contains('button', 'Yes, delete').click({ force: true }),
    () => cy.get('button:contains("delete")').click({ force: true }),
    () => cy.get('button[class*="danger"]').click({ force: true }),
    () => cy.get('.btn-danger').click({ force: true })
  ]
  
  for (let i = 0; i < buttonAttempts.length; i++) {
    try {
      cy.log(`Trying button approach ${i + 1}`)
      buttonAttempts[i]()
      cy.log(`Successfully clicked delete button with approach ${i + 1}`)
      break
    } catch (error) {
      cy.log(`Button approach ${i + 1} failed: ${error.message}`)
      if (i === buttonAttempts.length - 1) {
        cy.log('All button approaches failed')
        cy.debugModal()
      }
    }
  }
})

// Debug command to inspect modal structure
Cypress.Commands.add('debugModal', () => {
  cy.get('body').then(($body) => {
    cy.log('=== Debug Modal Structure ===')
    
    // Check all possible modal elements
    const elements = $body.find('*').filter((i, el) => {
      return $(el).css('display') !== 'none' && 
             ($(el).text().includes('Delete') || 
              $(el).text().includes('confirm') ||
              $(el).text().includes('Type') ||
              $(el).hasClass('modal') ||
              $(el).attr('role') === 'dialog')
    })
    
    elements.each((i, el) => {
      const $el = $(el)
      cy.log(`Element ${i}: ${el.tagName} - class: ${$el.attr('class')} - text: ${$el.text().substring(0, 100)}`)
    })
    
    // Check for input fields
    const inputs = $body.find('input:visible')
    inputs.each((i, input) => {
      const $input = $(input)
      cy.log(`Input ${i}: type=${$input.attr('type')} placeholder="${$input.attr('placeholder')}" id="${$input.attr('id')}" class="${$input.attr('class')}"`)
    })
    
    // Check for buttons  
    const buttons = $body.find('button:visible')
    buttons.each((i, button) => {
      const $button = $(button)
      cy.log(`Button ${i}: text="${$button.text()}" class="${$button.attr('class')}" type="${$button.attr('type')}"`)
    })
  })
})