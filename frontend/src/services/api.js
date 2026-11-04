import { requestAgent } from './domains/agent.js'
import { requestAdmin } from './domains/admin.js'
import { requestAuth } from './domains/auth.js'
import { requestBilling } from './domains/billing.js'
import { requestBudgets } from './domains/budgets.js'
import { requestChat } from './domains/chat.js'
import { requestCompanies } from './domains/companies.js'
import { requestGlobal } from './domains/global.js'
import { requestIntegrations } from './domains/integrations.js'
import { requestInventoryMovements } from './domains/inventory-movements.js'
import { requestLegal } from './domains/legal.js'
import { requestMarketing } from './domains/marketing.js'
import { requestProducts } from './domains/products.js'
import { requestProjects } from './domains/projects.js'
import { requestReports } from './domains/reports.js'
import { requestSuppliers } from './domains/suppliers.js'
import { requestTeams } from './domains/teams.js'
import { requestUploads } from './domains/uploads.js'

export {
  authHeaders,
  clearStoredToken,
  getApiBaseUrl,
  getStoredToken,
  resolveApiUrl,
  setStoredToken,
} from './http.js'

const domainServices = {
  agent: requestAgent,
  admin: requestAdmin,
  auth: requestAuth,
  billing: requestBilling,
  budgets: requestBudgets,
  chat: requestChat,
  companies: requestCompanies,
  global: requestGlobal,
  integrations: requestIntegrations,
  'inventory-movements': requestInventoryMovements,
  legal: requestLegal,
  marketing: requestMarketing,
  products: requestProducts,
  projects: requestProjects,
  reports: requestReports,
  suppliers: requestSuppliers,
  teams: requestTeams,
  uploads: requestUploads,
}

export function apiFetch(path, options) {
  if (typeof path !== 'string') {
    throw new TypeError('The API service requires a URL string')
  }

  const pathname = path.startsWith('http') ? new URL(path).pathname : path
  const domain = pathname.match(/^\/?api\/([^/?]+)/)?.[1]
  const request = Object.prototype.hasOwnProperty.call(domainServices, domain)
    ? domainServices[domain]
    : null
  if (!request) {
    throw new TypeError(`No API service is registered for ${domain || path}`)
  }

  return request(path, options)
}
