describe('Kong Route Automation', () => {
  before(() => {
    // 只在这个文件开始时删除所有的 route
    cy.visit('/workspaces')
    cy.clearAllRoutes()
  })

  beforeEach(() => {
    cy.visit('/workspaces')
  })

  it('should add a new route to Kong', () => {
    // Navigate to default workspace
    cy.contains('default').click()
    
    // Navigate to Routes section
    cy.contains('Routes').click()
    
    // cy.pause()
    // Click on New Route button with flexible selector
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="empty-state-action"]').length > 0) {
        cy.get('[data-testid="empty-state-action"]').click()
      } else if ($body.find('[data-testid="new-route-button"]').length > 0) {
        cy.get('[data-testid="new-route-button"]').click()
      } else if ($body.find('[data-testid*="new-route"]').length > 0) {
        cy.get('[data-testid*="new-route"]').first().click()
      } else if ($body.find('button:contains("New route")').length > 0) {
        cy.get('button:contains("New route")').click()
      } else if ($body.find('a:contains("New route")').length > 0) {
        cy.get('a:contains("New route")').click()
      } else if ($body.find(':contains("New route")').length > 0) {
        cy.contains('New route').click()
      } else {
        // Fallback: look for any button with "New" or "Add" or "Create"
        cy.get('button:contains("New"), a:contains("New"), button:contains("Add"), button:contains("Create")').first().click()
      }
    })

   
    
    // Fill in route details
    cy.fixture('kong-data').then((data) => {
      const route = data.route
      
      // Route name - try different possible field selectors
      cy.get('body').then(($body) => {
        if ($body.find('input[name="name"]').length > 0) {
          cy.get('input[name="name"]').clear().type(route.name)
        } else if ($body.find('input[placeholder*="name"], input[id*="name"]').length > 0) {
          cy.get('input[placeholder*="name"], input[id*="name"]').first().clear().type(route.name)
        } else {
          cy.log('Name field not found, continuing without setting name')
        }
      })
      
    
      // Service selection - handle the specific testid input
      if (route.service) {
        cy.get('body').then(($body) => {
          // Look for the specific route-form-service-id input
          if ($body.find('input[data-testid="route-form-service-id"]').length > 0) {
            cy.log('Found route-form-service-id input field')
            // Click the input to open dropdown
            cy.get('input[data-testid="route-form-service-id"]').click()
            cy.wait(1000)
            
            // Look for dropdown options or service list
            cy.get('body').then(($dropdownBody) => {
              // Try multiple selectors for dropdown options
              if ($dropdownBody.find(`li:contains("${route.service}"), .option:contains("${route.service}"), [role="option"]:contains("${route.service}")`).length > 0) {
                cy.get(`li:contains("${route.service}"), .option:contains("${route.service}"), [role="option"]:contains("${route.service}")`).first().click()
              } else if ($dropdownBody.find(`:contains("${route.service}")`).length > 0) {
                cy.contains(route.service).first().click()
              } else {
                cy.log(`Service ${route.service} not found in dropdown options`)
                // Try typing the service name directly
                cy.get('input[data-testid="route-form-service-id"]').type(route.service)
                cy.wait(500)
                cy.get('body').then(($typeBody) => {
                  if ($typeBody.find(`:contains("${route.service}")`).length > 0) {
                    cy.contains(route.service).first().click()
                  }
                })
              }
            })
            cy.log(`Selected service: ${route.service}`)
            
          } else if ($body.find('input[placeholder*="Select a service"], input[placeholder*="service"]').length > 0) {
            cy.log('Found service placeholder input field')
            // Click the input to open dropdown
            cy.get('input[placeholder*="Select a service"], input[placeholder*="service"]').first().click()
            cy.wait(1000)
            
            // Try to find and click the service
            cy.get('body').then(($dropdownBody) => {
              if ($dropdownBody.find(`:contains("${route.service}")`).length > 0) {
                cy.contains(route.service).first().click()
              } else {
                // Try typing the service name
                cy.get('input[placeholder*="Select a service"], input[placeholder*="service"]').first().type(route.service)
                cy.wait(500)
                cy.contains(route.service).first().click()
              }
            })
            
          } else if ($body.find('.dropdown, .select-dropdown, [role="combobox"]').length > 0) {
            cy.log('Found dropdown component')
            cy.get('.dropdown, .select-dropdown, [role="combobox"]').first().click()
            cy.wait(500)
            cy.contains(route.service).click()
            
          } else if ($body.find('select[name="service"]').length > 0) {
            cy.log(`Found service select, attempting to select: ${route.service}`)
            cy.get('select[name="service"]').should('be.visible').click()
            cy.wait(500)
            cy.get('select[name="service"]').select(route.service)
            cy.get('select[name="service"]').should('have.value', route.service)
            cy.log(`Successfully selected service: ${route.service}`)
            
          } else {
            cy.log('Service selection field not found - continuing without service selection')
          }
        })
      }
      
      // Paths
      if (route.paths && route.paths.length > 0) {
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="route-form-paths-input-1"]').length > 0) {
            cy.get('[data-testid="route-form-paths-input-1"]')
              .clear()
              .type(route.paths[0])
          } else if ($body.find('input[name="paths[0]"], input[name*="path"]').length > 0) {
            cy.get('input[name="paths[0]"], input[name*="path"]')
              .first()
              .clear()
              .type(route.paths[0])
          } else if ($body.find('input[placeholder*="path"], input[placeholder*="/api"]').length > 0) {
            cy.get('input[placeholder*="path"], input[placeholder*="/api"]')
              .first()
              .clear()
              .type(route.paths[0])
          } else {
            cy.log('Path field not found')
          }
        })
      }
      
      // Methods - try multiple UI patterns for method selection
      if (route.methods && route.methods.length > 0) {
        route.methods.forEach((method) => {
          cy.get('body').then(($body) => {
            if ($body.find(`input[type="checkbox"][value="${method}"]`).length > 0) {
              cy.get(`input[type="checkbox"][value="${method}"]`).check({ force: true })
            } else if ($body.find(`[data-testid*="method-${method.toLowerCase()}"], [data-testid*="${method.toLowerCase()}-checkbox"]`).length > 0) {
              cy.get(`[data-testid*="method-${method.toLowerCase()}"], [data-testid*="${method.toLowerCase()}-checkbox"]`).first().click({ force: true })
            } else if ($body.find(`button:contains("${method}"), .method-${method.toLowerCase()}, .${method.toLowerCase()}-method`).length > 0) {
              cy.get(`button:contains("${method}"), .method-${method.toLowerCase()}, .${method.toLowerCase()}-method`).first().click({ force: true })
            } else if ($body.find(`label:contains("${method}")`).length > 0) {
              cy.get(`label:contains("${method}")`).first().click({ force: true })
            } else if ($body.find(`:contains("${method}")`).length > 0) {
              // Generic method selection by text content
              cy.contains(method).first().click({ force: true })
            } else {
              cy.log(`Method selection for ${method} not found - trying to continue`)
            }
          })
        })
      }
      
      // Hosts - try multiple patterns for host field
      if (route.hosts && route.hosts.length > 0) {
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid*="host"], [data-testid*="hosts"]').length > 0) {
            cy.get('[data-testid*="host"], [data-testid*="hosts"]')
              .first()
              .clear()
              .type(route.hosts[0])
          } else if ($body.find('input[name="hosts[0]"], input[name*="host"]').length > 0) {
            cy.get('input[name="hosts[0]"], input[name*="host"]')
              .first()
              .clear()
              .type(route.hosts[0])
          } else if ($body.find('input[placeholder*="host"], input[placeholder*="domain"]').length > 0) {
            cy.get('input[placeholder*="host"], input[placeholder*="domain"]')
              .first()
              .clear()
              .type(route.hosts[0])
          } else {
            cy.log('Host field not found - continuing without host configuration')
          }
        })
      }
      
      // Handle strip_path checkbox
      if (route.strip_path !== undefined) {
        cy.get('body').then(($body) => {
          if ($body.find('input[name="strip_path"], input[id*="strip"], input[data-testid*="strip"]').length > 0) {
            const stripPathCheckbox = cy.get('input[name="strip_path"], input[id*="strip"], input[data-testid*="strip"]').first()
            if (route.strip_path) {
              stripPathCheckbox.check({ force: true })
            } else {
              stripPathCheckbox.uncheck({ force: true })
            }
            cy.log(`Set strip_path to: ${route.strip_path}`)
          } else {
            cy.log('Strip path checkbox not found')
          }
        })
      }
    })
    // cy.pause()
    // Submit the form
    cy.get('button[type="submit"]')
      .contains('Save')
      .click()
    
 
    
    // Verify route appears in the list
    cy.fixture('kong-data').then((data) => {
      cy.contains(data.route.name)
        .should('be.visible')
    })
  })

  it('should create route with advanced configuration', () => {
    cy.navigateToDefaultWorkspace()
    cy.contains('Routes').click()
    
    // Use flexible button selection logic
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="empty-state-action"]').length > 0) {
        cy.get('[data-testid="empty-state-action"]').click()
      } else if ($body.find('[data-testid="new-route-button"]').length > 0) {
        cy.get('[data-testid="new-route-button"]').click()
      } else if ($body.find('[data-testid*="new-route"]').length > 0) {
        cy.get('[data-testid*="new-route"]').first().click()
      } else if ($body.find(':contains("New route")').length > 0) {
        cy.contains('New route').click()
      } else {
        cy.get('button:contains("New"), a:contains("New"), button:contains("Add"), button:contains("Create")').first().click()
      }
    })
    
    cy.fixture('kong-data').then((data) => {
      const advancedRoute = data.advancedRoute
      
      // Route name - use flexible selectors
      cy.get('body').then(($body) => {
        if ($body.find('input[name="name"]').length > 0) {
          cy.get('input[name="name"]').clear().type(advancedRoute.name)
        } else if ($body.find('input[placeholder*="name"], input[id*="name"]').length > 0) {
          cy.get('input[placeholder*="name"], input[id*="name"]').first().clear().type(advancedRoute.name)
        } else {
          cy.log('Name field not found, continuing without setting name')
        }
      })
      
      // Service selection - handle the specific testid input
      if (advancedRoute.service) {
        cy.get('body').then(($body) => {
          // Look for the specific route-form-service-id input
          if ($body.find('input[data-testid="route-form-service-id"]').length > 0) {
            cy.log('Found route-form-service-id input field')
            // Click the input to open dropdown
            cy.get('input[data-testid="route-form-service-id"]').click()
            cy.wait(1000)
            
            // Look for dropdown options or service list
            cy.get('body').then(($dropdownBody) => {
              // Try multiple selectors for dropdown options
              if ($dropdownBody.find(`li:contains("${advancedRoute.service}"), .option:contains("${advancedRoute.service}"), [role="option"]:contains("${advancedRoute.service}")`).length > 0) {
                cy.get(`li:contains("${advancedRoute.service}"), .option:contains("${advancedRoute.service}"), [role="option"]:contains("${advancedRoute.service}")`).first().click()
              } else if ($dropdownBody.find(`:contains("${advancedRoute.service}")`).length > 0) {
                cy.contains(advancedRoute.service).first().click()
              } else {
                cy.log(`Service ${advancedRoute.service} not found in dropdown options`)
                // Try typing the service name directly
                cy.get('input[data-testid="route-form-service-id"]').type(advancedRoute.service)
                cy.wait(500)
                cy.get('body').then(($typeBody) => {
                  if ($typeBody.find(`:contains("${advancedRoute.service}")`).length > 0) {
                    cy.contains(advancedRoute.service).first().click()
                  }
                })
              }
            })
            cy.log(`Selected service: ${advancedRoute.service}`)
            
          } else if ($body.find('input[placeholder*="Select a service"], input[placeholder*="service"]').length > 0) {
            cy.log('Found service placeholder input field')
            // Click the input to open dropdown
            cy.get('input[placeholder*="Select a service"], input[placeholder*="service"]').first().click()
            cy.wait(1000)
            
            // Try to find and click the service
            cy.get('body').then(($dropdownBody) => {
              if ($dropdownBody.find(`:contains("${advancedRoute.service}")`).length > 0) {
                cy.contains(advancedRoute.service).first().click()
              } else {
                // Try typing the service name
                cy.get('input[placeholder*="Select a service"], input[placeholder*="service"]').first().type(advancedRoute.service)
                cy.wait(500)
                cy.contains(advancedRoute.service).first().click()
              }
            })
            
          } else if ($body.find('.dropdown, .select-dropdown, [role="combobox"]').length > 0) {
            cy.log('Found dropdown component')
            cy.get('.dropdown, .select-dropdown, [role="combobox"]').first().click()
            cy.wait(500)
            cy.contains(advancedRoute.service).click()
            
          } else if ($body.find('select[name="service"]').length > 0) {
            cy.log(`Found service select, attempting to select: ${advancedRoute.service}`)
            cy.get('select[name="service"]').should('be.visible').click()
            cy.wait(500)
            cy.get('select[name="service"]').select(advancedRoute.service)
            cy.get('select[name="service"]').should('have.value', advancedRoute.service)
            cy.log(`Successfully selected service: ${advancedRoute.service}`)
            
          } else {
            cy.log('Service selection field not found - continuing without service selection')
          }
        })
      }
      
      // Paths - use flexible selectors
      if (advancedRoute.paths && advancedRoute.paths.length > 0) {
        cy.get('body').then(($body) => {
          if ($body.find('input[name="paths[0]"]').length > 0) {
            cy.get('input[name="paths[0]"]').clear().type(advancedRoute.paths[0])
          } else if ($body.find('[data-testid="route-form-paths-input-1"]').length > 0) {
            cy.get('[data-testid="route-form-paths-input-1"]').clear().type(advancedRoute.paths[0])
          } else if ($body.find('input[name*="path"]').length > 0) {
            cy.get('input[name*="path"]').first().clear().type(advancedRoute.paths[0])
          } else if ($body.find('input[placeholder*="path"], input[placeholder*="/api"]').length > 0) {
            cy.get('input[placeholder*="path"], input[placeholder*="/api"]').first().clear().type(advancedRoute.paths[0])
          } else {
            cy.log('Path field not found')
          }
        })
      }
      
      // Methods - use flexible selectors
      if (advancedRoute.methods && advancedRoute.methods.length > 0) {
        advancedRoute.methods.forEach((method) => {
          cy.get('body').then(($body) => {
            if ($body.find(`input[type="checkbox"][value="${method}"]`).length > 0) {
              cy.get(`input[type="checkbox"][value="${method}"]`).check({ force: true })
            } else if ($body.find(`[data-testid*="method-${method.toLowerCase()}"], [data-testid*="${method.toLowerCase()}-checkbox"]`).length > 0) {
              cy.get(`[data-testid*="method-${method.toLowerCase()}"], [data-testid*="${method.toLowerCase()}-checkbox"]`).first().click({ force: true })
            } else if ($body.find(`button:contains("${method}"), .method-${method.toLowerCase()}, .${method.toLowerCase()}-method`).length > 0) {
              cy.get(`button:contains("${method}"), .method-${method.toLowerCase()}, .${method.toLowerCase()}-method`).first().click({ force: true })
            } else if ($body.find(`label:contains("${method}")`).length > 0) {
              cy.get(`label:contains("${method}")`).first().click({ force: true })
            } else if ($body.find(`:contains("${method}")`).length > 0) {
              cy.contains(method).first().click({ force: true })
            } else {
              cy.log(`Method selection for ${method} not found - trying to continue`)
            }
          })
        })
      }
      
      // Expand advanced options - try multiple ways to find Advanced button
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Advanced")').length > 0) {
          cy.get('button:contains("Advanced")').first().click()
        } else if ($body.find('button:contains("Show advanced")').length > 0) {
          cy.get('button:contains("Show advanced")').first().click()
        } else if ($body.find('[data-testid*="advanced"], .advanced-toggle').length > 0) {
          cy.get('[data-testid*="advanced"], .advanced-toggle').first().click()
        } else {
          cy.log('Advanced options button not found - continuing with basic options')
        }
      })
      
      cy.wait(1000)
      
      // Strip path
      if (advancedRoute.strip_path !== undefined) {
        cy.get('body').then(($body) => {
          if ($body.find('input[name="strip_path"], input[id*="strip"], input[data-testid*="strip"]').length > 0) {
            const stripPathCheckbox = cy.get('input[name="strip_path"], input[id*="strip"], input[data-testid*="strip"]').first()
            if (advancedRoute.strip_path) {
              stripPathCheckbox.check({ force: true })
            } else {
              stripPathCheckbox.uncheck({ force: true })
            }
            cy.log(`Set strip_path to: ${advancedRoute.strip_path}`)
          } else {
            cy.log('Strip path checkbox not found')
          }
        })
      }
      
      // Preserve host
      if (advancedRoute.preserve_host !== undefined) {
        cy.get('body').then(($body) => {
          if ($body.find('input[name="preserve_host"], input[id*="preserve"], input[data-testid*="preserve"]').length > 0) {
            const preserveHostCheckbox = cy.get('input[name="preserve_host"], input[id*="preserve"], input[data-testid*="preserve"]').first()
            if (advancedRoute.preserve_host) {
              preserveHostCheckbox.check({ force: true })
            } else {
              preserveHostCheckbox.uncheck({ force: true })
            }
            cy.log(`Set preserve_host to: ${advancedRoute.preserve_host}`)
          } else {
            cy.log('Preserve host checkbox not found')
          }
        })
      }
      
      // Tags
      if (advancedRoute.tags && advancedRoute.tags.length > 0) {
        cy.get('body').then(($body) => {
          if ($body.find('input[name="tags"]').length > 0) {
            cy.get('input[name="tags"]').clear().type(advancedRoute.tags.join(','))
          } else if ($body.find('input[placeholder*="tag"], input[id*="tag"]').length > 0) {
            cy.get('input[placeholder*="tag"], input[id*="tag"]').first().clear().type(advancedRoute.tags.join(','))
          } else {
            cy.log('Tags field not found')
          }
        })
      }
    })
    debugger
 
    cy.get('button[type="submit"]').contains('Save').click()

     // Verify route appears in the list
    cy.fixture('kong-data').then((data) => {
      cy.contains(data.route.name)
        .should('be.visible')
    })
    
    
    
  })

  it.skip('should link route to existing service', () => {
    // First ensure a service exists
    cy.createService()
    
    // Then create route
    cy.navigateToDefaultWorkspace()
    cy.contains('Routes').click()
    
    // Use flexible button selection logic
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="empty-state-action"]').length > 0) {
        cy.get('[data-testid="empty-state-action"]').click()
      } else if ($body.find('[data-testid="new-route-button"]').length > 0) {
        cy.get('[data-testid="new-route-button"]').click()
      } else if ($body.find('[data-testid*="new-route"]').length > 0) {
        cy.get('[data-testid*="new-route"]').first().click()
      } else if ($body.find(':contains("New route")').length > 0) {
        cy.contains('New route').click()
      } else {
        cy.get('button:contains("New"), a:contains("New"), button:contains("Add"), button:contains("Create")').first().click()
      }
    })
    
    cy.fixture('kong-data').then((data) => {
      const route = data.linkedRoute
      
      // Route name - use flexible selectors
      cy.get('body').then(($body) => {
        if ($body.find('input[name="name"]').length > 0) {
          cy.get('input[name="name"]').clear().type(route.name)
        } else if ($body.find('input[placeholder*="name"], input[id*="name"]').length > 0) {
          cy.get('input[placeholder*="name"], input[id*="name"]').first().clear().type(route.name)
        } else {
          cy.log('Name field not found, continuing without setting name')
        }
      })
      
      // Service selection - handle the specific testid input
      cy.get('body').then(($body) => {
        // Look for the specific route-form-service-id input
        if ($body.find('input[data-testid="route-form-service-id"]').length > 0) {
          cy.log('Found route-form-service-id input field')
          // Click the input to open dropdown
          cy.get('input[data-testid="route-form-service-id"]').click()
          cy.wait(1000)
          
          // Look for dropdown options or service list
          cy.get('body').then(($dropdownBody) => {
            // Try multiple selectors for dropdown options
            if ($dropdownBody.find(`li:contains("${data.service.name}"), .option:contains("${data.service.name}"), [role="option"]:contains("${data.service.name}")`).length > 0) {
              cy.get(`li:contains("${data.service.name}"), .option:contains("${data.service.name}"), [role="option"]:contains("${data.service.name}")`).first().click()
            } else if ($dropdownBody.find(`:contains("${data.service.name}")`).length > 0) {
              cy.contains(data.service.name).first().click()
            } else {
              cy.log(`Service ${data.service.name} not found in dropdown options`)
              // Try typing the service name directly
              cy.get('input[data-testid="route-form-service-id"]').type(data.service.name)
              cy.wait(500)
              cy.get('body').then(($typeBody) => {
                if ($typeBody.find(`:contains("${data.service.name}")`).length > 0) {
                  cy.contains(data.service.name).first().click()
                }
              })
            }
          })
          cy.log(`Selected service: ${data.service.name}`)
          
        } else if ($body.find('input[placeholder*="Select a service"], input[placeholder*="service"]').length > 0) {
          cy.log('Found service placeholder input field')
          // Click the input to open dropdown
          cy.get('input[placeholder*="Select a service"], input[placeholder*="service"]').first().click()
          cy.wait(1000)
          
          // Try to find and click the service
          cy.get('body').then(($dropdownBody) => {
            if ($dropdownBody.find(`:contains("${data.service.name}")`).length > 0) {
              cy.contains(data.service.name).first().click()
            } else {
              // Try typing the service name
              cy.get('input[placeholder*="Select a service"], input[placeholder*="service"]').first().type(data.service.name)
              cy.wait(500)
              cy.contains(data.service.name).first().click()
            }
          })
          
        } else if ($body.find('.dropdown, .select-dropdown, [role="combobox"]').length > 0) {
          cy.log('Found dropdown component')
          cy.get('.dropdown, .select-dropdown, [role="combobox"]').first().click()
          cy.wait(500)
          cy.contains(data.service.name).click()
          
        } else if ($body.find('select[name="service"]').length > 0) {
          cy.log(`Found service select, attempting to select: ${data.service.name}`)
          cy.get('select[name="service"]').should('be.visible').click()
          cy.wait(500)
          cy.get('select[name="service"]').select(data.service.name)
          cy.get('select[name="service"]').should('have.value', data.service.name)
          cy.log(`Successfully selected service: ${data.service.name}`)
          
        } else {
          cy.log('Service selection field not found')
        }
      })
      
      // Paths - use flexible selectors
      cy.get('body').then(($body) => {
        if ($body.find('input[name="paths[0]"]').length > 0) {
          cy.get('input[name="paths[0]"]').clear().type(route.paths[0])
        } else if ($body.find('[data-testid="route-form-paths-input-1"]').length > 0) {
          cy.get('[data-testid="route-form-paths-input-1"]').clear().type(route.paths[0])
        } else if ($body.find('input[name*="path"]').length > 0) {
          cy.get('input[name*="path"]').first().clear().type(route.paths[0])
        } else if ($body.find('input[placeholder*="path"], input[placeholder*="/api"]').length > 0) {
          cy.get('input[placeholder*="path"], input[placeholder*="/api"]').first().clear().type(route.paths[0])
        } else {
          cy.log('Path field not found')
        }
      })
    })
    
    cy.get('button[type="submit"]').contains('Save').click()
    cy.contains('Route created successfully').should('be.visible')
  })
})