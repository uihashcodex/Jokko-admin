import { constant } from "../const";
import axios from "axios";

const API_BASE_URL = `${constant.backend_url}/management/staff`;
console.log("API_BASE_URL:", API_BASE_URL);

// Get admin token from localStorage
const getAuthToken = () => localStorage.getItem("adminToken");

// Get staff list with pagination and filters
export const getStaffList = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/list`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single staff by ID
export const getStaffById = async (staffId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${staffId}`, {}, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new staff
export const createStaff = async (staffData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create`, staffData, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update staff
export const updateStaff = async (staffId, staffData) => {
  try {
    const payload = { staffId, ...staffData };
    const response = await axios.post(`${API_BASE_URL}/update`, payload, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update staff status
export const updateStaffStatus = async (staffId, status) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/status`,
      { staffId, status },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
