/**
 * This file contains integration points for the Coach Dashboard 
 * to interact with the backend API
 * 
 * Replace localStorage calls with API calls gradually
 */

import api from '../utils/api';

/**
 * Get dashboard statistics for a coach
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getCoachDashboardStats = async () => {
  try {
    const response = await api.fetch('/api/coaches/dashboard', api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching coach dashboard stats:', error);
    throw error;
  }
};

/**
 * Get appointments for a coach
 * @returns {Promise<Array>} Coach appointments
 */
export const getCoachAppointments = async () => {
  try {
    const response = await api.fetch('/api/appointments/coach', api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching coach appointments:', error);
    throw error;
  }
};

/**
 * Get messages for a specific appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @returns {Promise<Array>} Messages for the appointment
 */
export const getAppointmentMessages = async (appointmentId) => {
  try {
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages`, api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Send a message for a specific appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {Object} messageData - The message data
 * @returns {Promise<Object>} The created message
 */
export const sendAppointmentMessage = async (appointmentId, messageData) => {
  try {
    const options = api.addAuthHeader({
      method: 'POST',
      body: JSON.stringify(messageData)
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages`, options);
    return response.data;
  } catch (error) {
    console.error(`Error sending message for appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Mark messages as read for a specific appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @returns {Promise<Object>} Result of the operation
 */
export const markMessagesAsRead = async (appointmentId) => {
  try {
    const options = api.addAuthHeader({
      method: 'POST'
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages/read`, options);
    return response.data;
  } catch (error) {
    console.error(`Error marking messages as read for appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Get unread message counts for all appointments
 * @returns {Promise<Object>} Unread message counts per appointment
 */
export const getUnreadMessageCounts = async () => {
  try {
    const response = await api.fetch('/api/messages/unread-counts', api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching unread message counts:', error);
    throw error;
  }
};

/**
 * Update appointment status
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {string} status - The new status
 * @returns {Promise<Object>} Updated appointment
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const options = api.addAuthHeader({
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/status`, options);
    return response.data;
  } catch (error) {
    console.error(`Error updating status for appointment ${appointmentId}:`, error);
    throw error;
  }
};
