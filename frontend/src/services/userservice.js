import axios from 'axios';
import config from './config';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userSignin = async (email, password) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/auth/signin`, { email, password });
    if (response.data && response.data.data) {
      const { token, user } = response.data.data;
      if (token) localStorage.setItem('token', token);
      return { user, token };
    }
    throw new Error(response.data?.message || 'Authentication failed');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Invalid credentials or backend server offline');
  }
};

export const userSignup = async (userData) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/auth/signup`, userData);
    return response.data?.data || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const getProfile = async (userId) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/users/profile/${userId}`, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

export const updateProfile = async (userId, updateData) => {
  try {
    const response = await axios.put(`${config.BASE_URL}/users/profile/${userId}`, updateData, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const softDeleteCustomer = async (userId) => {
  try {
    const response = await axios.delete(`${config.BASE_URL}/customer/delete-account/${userId}`, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot delete account because you have an upcoming journey.');
  }
};

export const resubmitOperatorDocs = async (operatorId, resubmitData) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/operator/resubmit/${operatorId}`, resubmitData, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Resubmission failed');
  }
};

export const checkOperatorDeactivationEligibility = async (operatorId) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/operator/deactivate-check/${operatorId}`, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check deactivation eligibility');
  }
};

export const requestOperatorDeactivation = async (operatorId, reason) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/operator/deactivate-request/${operatorId}?reason=${encodeURIComponent(reason || '')}`, {}, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot request account deactivation while you have scheduled or upcoming trips.');
  }
};

export const getPendingOperators = async () => {
  try {
    const response = await axios.get(`${config.BASE_URL}/admin/pending-operators`, { headers: getAuthHeader() });
    return response.data?.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch pending operators');
  }
};

export const getAllOperators = async () => {
  try {
    const response = await axios.get(`${config.BASE_URL}/admin/all-operators`, { headers: getAuthHeader() });
    return response.data?.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch all operators');
  }
};

export const searchOperatorsByName = async (query) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/admin/operators/search?query=${encodeURIComponent(query || '')}`, { headers: getAuthHeader() });
    return response.data?.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search operators');
  }
};

export const getOperatorAuditDetails = async (operatorId) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/admin/operators/${operatorId}/audit`, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch operator audit details');
  }
};

export const approveOperator = async (approvalData) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/admin/approve-operator`, approvalData, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Approval processing failed');
  }
};

export const getDeactivationRequests = async () => {
  try {
    const response = await axios.get(`${config.BASE_URL}/admin/deactivation-requests`, { headers: getAuthHeader() });
    return response.data?.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch deactivation requests');
  }
};

export const processDeactivation = async (operatorId, approve) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/admin/process-deactivation?operatorId=${operatorId}&approve=${approve}`, {}, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Processing deactivation failed');
  }
};

export const toggleOperatorStatus = async (operatorId, isActive) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/admin/toggle-operator-status?operatorId=${operatorId}&isActive=${isActive}`, {}, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update operator active status');
  }
};
