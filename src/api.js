// src/api.js
import axios from "axios";

// Base URL of your FastAPI backend
const API_URL = "http://127.0.0.1:8000";

// -------------------- GET --------------------
// Fetch all job applications
export const getApplications = async () => {
  try {
    const response = await axios.get(`${API_URL}/applications`);
    return response.data;
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
};

// -------------------- POST --------------------
// Add a new application
export const addApplication = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/applications`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding application:", error);
    return null;
  }
};

// -------------------- PUT --------------------
// Update an existing application by ID
export const updateApplication = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/applications/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating application:", error);
    return null;
  }
};

// -------------------- DELETE --------------------
// Delete an application by ID
export const deleteApplication = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/applications/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting application:", error);
    return null;
  }
};
