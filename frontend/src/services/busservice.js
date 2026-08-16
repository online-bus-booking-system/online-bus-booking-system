import axios from 'axios';
import config from './config';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const registerBus = async (operatorId, busData) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/buses/register?operatorId=${operatorId}`, busData, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to register bus vehicle');
  }
};

export const getOperatorBuses = async (operatorId) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/buses/operator/${operatorId}`, { headers: getAuthHeader() });
    return response.data?.data || [];
  } catch (error) {
    return [];
  }
};

export const getBusesByOperator = getOperatorBuses;

export const createRoute = async (routeData, operatorId) => {
  try {
    const url = operatorId ? `${config.BASE_URL}/routes/create?operatorId=${operatorId}` : `${config.BASE_URL}/routes/create`;
    const response = await axios.post(url, routeData, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create route');
  }
};

export const getRoutesByOperator = async (operatorId) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/routes/operator/${operatorId}`, { headers: getAuthHeader() });
    return response.data?.data || [];
  } catch (error) {
    return [];
  }
};

export const getAllRoutes = async () => {
  try {
    const response = await axios.get(`${config.BASE_URL}/routes/all`);
    return response.data?.data || [];
  } catch (error) {
    return [];
  }
};

export const scheduleTrip = async (tripData) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/trips/create`, tripData, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to schedule trip');
  }
};

export const createTrip = scheduleTrip;

export const cancelTripByOperator = async (tripId, operatorId) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/trips/${tripId}/cancel?operatorId=${operatorId}`, {}, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot cancel trip because seats have already been booked by passengers.');
  }
};

export const searchTrips = async (source, destination, date) => {
  try {
    const params = new URLSearchParams({ source, destination });
    if (date) params.append('date', date);
    const response = await axios.get(`${config.BASE_URL}/trips/search?${params.toString()}`);
    return response.data?.data || [];
  } catch (error) {
    return [];
  }
};

export const getTripById = async (tripId) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/trips/${tripId}`);
    return response.data?.data;
  } catch (error) {
    return null;
  }
};

export const getOperatorTrips = async (operatorId) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/trips/operator/${operatorId}`, { headers: getAuthHeader() });
    return response.data?.data || [];
  } catch (error) {
    return [];
  }
};

export const getTripsByOperator = getOperatorTrips;
