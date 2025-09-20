// src/services/adminService.js
export const adminService = {
  getDashboardData: async () => {
    // Dummy response for now
    return {
      users: 120,
      activeUsers: 85,
      alerts: 3,
      systemStatus: "healthy"
    };
  }
};
