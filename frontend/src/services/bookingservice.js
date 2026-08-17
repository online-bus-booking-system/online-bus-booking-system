import axios from 'axios';
import config from './config';
import { toast } from 'react-toastify';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createBooking = async (userId, bookingData) => {
  try {
    const url = userId && userId > 0
      ? `${config.BASE_URL}/bookings/create?userId=${userId}`
      : `${config.BASE_URL}/bookings/create`;
    const response = await axios.post(url, bookingData, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Booking creation failed. Seat might be booked.');
  }
};

export const getCustomerBookings = async (userId) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/bookings/my-bookings/${userId}`, { headers: getAuthHeader() });
    return response.data?.data || [];
  } catch (error) {
    return [];
  }
};

export const getBookingByPnr = async (pnrNumber) => {
  try {
    const response = await axios.get(`${config.BASE_URL}/bookings/pnr/${pnrNumber}`, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    return null;
  }
};

export const getBookingByPnrAndPhone = async (pnrNumber, mobileNumber) => {
  try {
    const url = `${config.BASE_URL}/bookings/find-ticket`;
    const response = await axios.post(url, { pnrNumber, mobileNumber });
    return response.data?.data;
  } catch (ex) {
    console.error('getBookingByPnrAndPhone error:', ex);
    const message = ex.response?.data?.message || 'No ticket found with provided PNR and Mobile Number';
    toast.error(message);
    return null;
  }
};

export const cancelBooking = async (userId, cancelData) => {
  try {
    const url = userId && userId > 0
      ? `${config.BASE_URL}/bookings/cancel?userId=${userId}`
      : `${config.BASE_URL}/bookings/cancel`;
    const response = await axios.post(url, cancelData, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel booking');
  }
};

export const submitReview = async (reviewData) => {
  try {
    const response = await axios.post(`${config.BASE_URL}/reviews/submit`, reviewData, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit review');
  }
};

export const getPlatformRevenue = async () => {
  try {
    const response = await axios.get(`${config.BASE_URL}/admin/platform-revenue`, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    return null;
  }
};

export const getOperatorDashboardStats = async (operatorId, period = 'monthly') => {
  try {
    const response = await axios.get(`${config.BASE_URL}/operator/dashboard-stats/${operatorId}?period=${period}`, { headers: getAuthHeader() });
    return response.data?.data;
  } catch (error) {
    return null;
  }
};
