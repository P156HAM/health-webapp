export const isMockMode = process.env.REACT_APP_USE_MOCKS === 'true'

// Small helper to mimic network latency in mock mode
export const mockDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))
