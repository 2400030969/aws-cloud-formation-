const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new Error('Backend server unavailable. Start Spring Boot on http://localhost:8080.')
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.message || 'The request could not be completed.')
  return payload
}

export const api = {
  templates: () => request('/templates'),
  template: (id) => request(`/templates/${id}`),
  createTemplate: (body) => request('/templates', { method: 'POST', body: JSON.stringify(body) }),
  updateTemplate: (id, body) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: 'DELETE' }),
  validateTemplate: (id) => request(`/templates/${id}/validate`, { method: 'POST' }),
  deployments: () => request('/deployments'),
  deployment: (id) => request(`/deployments/${id}`),
  simulateDeployment: (body) => request('/deployments', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/users/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/users/register', { method: 'POST', body: JSON.stringify(body) }),
  user: (id) => request(`/users/${id}`),
}

export function validateYaml(yaml) {
  const errors = []
  if (!yaml?.trim()) return { valid: false, errors: ['YAML content cannot be empty.'] }
  if (!yaml.includes('AWSTemplateFormatVersion:')) errors.push('Missing AWSTemplateFormatVersion.')
  if (!/^Resources\s*:/m.test(yaml)) errors.push('Missing Resources section.')
  else {
    const resources = yaml.slice(yaml.indexOf('Resources:') + 'Resources:'.length)
    if (!/^\s{2}[A-Za-z][A-Za-z0-9]*:\s*$/m.test(resources) || !resources.includes('Type: AWS::')) {
      errors.push('Resources must contain at least one named AWS resource and an AWS:: type.')
    }
  }
  return { valid: errors.length === 0, errors }
}
