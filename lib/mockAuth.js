// TEMPORARY MOCK AUTH FOR TESTING - REMOVE AFTER TESTING
// This provides a mock user with a mock company ID so API routes work without authentication

export function getMockUser() {
  return {
    sub: '507f1f77bcf86cd799439011', // Mock user ID
    role: 'admin',
    companyId: '507f1f77bcf86cd799439012', // Mock company ID
  };
}

export function isMockAuthEnabled() {
  return true; // Set to false to re-enable real authentication
}
