// client.js

const axios = require('axios');

// Set the base URL for your server
const baseURL = 'http://localhost:3000'; // Update this with your server URL

// Function to perform administrator login
async function adminLogin(username, password) {
  try {
    const response = await axios.post(`${baseURL}/admin/login`, { username, password });
    return response.data;
  } catch (error) {
    console.error('Error in admin login:', error.response.data);
    throw error;
  }
}

// Function to perform administrator logout
async function adminLogout(token, username, password) {
  try {
    const response = await axios.post(
      `${baseURL}/admin/logout`,
      { username, password },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in admin logout:', error.response.data);
    throw error;
  }
}

// Example usage:
// Replace 'adminUsername' and 'adminPassword' with your actual admin credentials
const adminUsername = 'admin';
const adminPassword = 'adminpassword';

// Perform admin login
adminLogin(adminUsername, adminPassword)
  .then((loginResponse) => {
    console.log('Admin Login Response:', loginResponse);

    // Assuming login is successful, you can use the returned token for subsequent requests
    const adminToken = loginResponse.token;

    // Perform admin logout
    return adminLogout(adminToken, adminUsername, adminPassword);
  })
  .then((logoutResponse) => {
    console.log('Admin Logout Response:', logoutResponse);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });