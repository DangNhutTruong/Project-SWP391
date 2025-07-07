import { pool } from '../config/database.js';

/**
 * Model class for handling appointment-related database operations
 */
class Appointment {
    /**
     * Create a new appointment
     * @param {Object} appointmentData - Data for the new appointment
     * @returns {Object} The created appointment with ID
     */
    static async create(appointmentData) {
        try {
            console.log('🔍 Creating new appointment:', appointmentData);
            
            const { coach_id, user_id, appointment_time, duration_minutes } = appointmentData;
            
            // Validate coach exists and is actually a coach
            const [coachRows] = await pool.query(
                'SELECT id FROM users WHERE id = ? AND role = ?',
                [coach_id, 'coach']
            );
            
            if (coachRows.length === 0) {
                console.log('⚠️ Invalid coach ID or not a coach:', coach_id);
                return { error: 'Invalid coach ID' };
            }
            
            // Validate user exists
            const [userRows] = await pool.query(
                'SELECT id FROM users WHERE id = ?',
                [user_id]
            );
            
            if (userRows.length === 0) {
                console.log('⚠️ Invalid user ID:', user_id);
                return { error: 'Invalid user ID' };
            }
            
            // Parse and validate appointment time
            let appointmentDate;
            try {
                appointmentDate = new Date(appointment_time);
                
                // Check if date is valid
                if (isNaN(appointmentDate.getTime())) {
                    console.log('⚠️ Invalid appointment time format:', appointment_time);
                    return { error: 'Invalid appointment time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)' };
                }
                
                // Check if appointment is in the future
                const now = new Date();
                if (appointmentDate <= now) {
                    console.log('⚠️ Appointment time must be in the future:', appointment_time);
                    return { error: 'Appointment time must be in the future' };
                }
            } catch (error) {
                console.log('⚠️ Error parsing appointment time:', error);
                return { error: 'Invalid appointment time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)' };
            }
            
            // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
            let dayOfWeek = appointmentDate.getDay();
            
            // Map JavaScript day number to day name for string comparison
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[dayOfWeek];
            
            const appointmentTimeStr = appointmentDate.toTimeString().slice(0, 8);
            
            console.log('🔍 Checking availability with:', {
                coach_id,
                dayOfWeek,
                dayName,
                appointmentTimeStr,
                date: appointmentDate
            });
            
            const [availabilityRows] = await pool.query(
                `SELECT id FROM coach_availability 
                 WHERE coach_id = ? 
                 AND day_of_week = ?
                 AND ? BETWEEN start_time AND end_time`,
                [coach_id, dayName, appointmentTimeStr]
            );
            
            if (availabilityRows.length === 0) {
                console.log('⚠️ Appointment time not within coach availability');
                return { error: 'Appointment time not within coach availability' };
            }
            
            // Check if appointment time conflicts with existing appointments
            const appointmentEndTime = new Date(appointmentDate);
            appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + duration_minutes);
            
            const [conflictRows] = await pool.query(
                `SELECT id FROM appointment
                 WHERE coach_id = ?
                 AND status != 'cancelled'
                 AND (
                    (appointment_time <= ? AND DATE_ADD(appointment_time, INTERVAL duration_minutes MINUTE) > ?)
                    OR
                    (appointment_time < ? AND DATE_ADD(appointment_time, INTERVAL duration_minutes MINUTE) >= ?)
                    OR
                    (appointment_time >= ? AND appointment_time < ?)
                 )`,
                [coach_id, appointmentEndTime, appointmentDate, appointmentEndTime, appointmentDate, appointmentDate, appointmentEndTime]
            );
            
            if (conflictRows.length > 0) {
                console.log('⚠️ Appointment time conflicts with existing appointment');
                return { error: 'Appointment time conflicts with existing appointment' };
            }
            
            // Format the appointment time for MySQL
            const formattedAppointmentTime = appointmentDate.toISOString().slice(0, 19).replace('T', ' ');
            
            // Create appointment
            const [result] = await pool.query(
                `INSERT INTO appointment (coach_id, user_id, appointment_time, duration_minutes, status)
                 VALUES (?, ?, ?, ?, 'pending')`,
                [coach_id, user_id, formattedAppointmentTime, duration_minutes]
            );
            
            if (result.affectedRows === 0) {
                console.log('❌ Failed to create appointment');
                return { error: 'Failed to create appointment' };
            }
            
            // Get the created appointment
            const [appointmentRows] = await pool.query(
                `SELECT a.*, u.full_name as coach_name, u.profile_image as coach_avatar
                 FROM appointment a
                 JOIN users u ON a.coach_id = u.id
                 WHERE a.id = ?`,
                [result.insertId]
            );
            
            console.log('✅ Appointment created successfully with ID:', result.insertId);
            return appointmentRows[0];
        } catch (error) {
            console.error('❌ Error creating appointment:', error);
            throw error;
        }
    }
    
    /**
     * Get all appointments for a user
     * @param {number} userId - The user's ID
     * @returns {Array} List of appointments for the user
     */
    static async getByUserId(userId) {
        try {
            console.log('🔍 Getting appointments for user ID:', userId);
            
            const [rows] = await pool.query(
                `SELECT a.*, u.full_name as coach_name, u.profile_image as coach_avatar 
                 FROM appointment a
                 JOIN users u ON a.coach_id = u.id
                 WHERE a.user_id = ?
                 ORDER BY a.appointment_time DESC`,
                [userId]
            );
            
            console.log(`✅ Found ${rows.length} appointments for user ID:`, userId);
            return rows;
        } catch (error) {
            console.error('❌ Error getting appointments for user:', error);
            throw error;
        }
    }
    
    /**
     * Get a specific appointment by ID
     * @param {number} id - The appointment ID
     * @returns {Object} The appointment details
     */
    static async getById(id) {
        try {
            console.log('🔍 Getting appointment by ID:', id);
            
            const [rows] = await pool.query(
                `SELECT a.*, 
                        u_coach.full_name as coach_name, 
                        u_coach.profile_image as coach_avatar,
                        u_user.full_name as user_name,
                        u_user.profile_image as user_avatar
                 FROM appointment a
                 JOIN users u_coach ON a.coach_id = u_coach.id
                 JOIN users u_user ON a.user_id = u_user.id
                 WHERE a.id = ?`,
                [id]
            );
            
            if (rows.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return null;
            }
            
            console.log('✅ Found appointment with ID:', id);
            return rows[0];
        } catch (error) {
            console.error('❌ Error getting appointment by ID:', error);
            throw error;
        }
    }
    
    /**
     * Update an appointment's details
     * @param {number} id - The appointment ID
     * @param {Object} updateData - The data to update
     * @returns {Object} The updated appointment
     */
    static async update(id, updateData) {
        try {
            console.log('🔍 Updating appointment ID:', id, 'with data:', updateData);
            
            // Get the current appointment to check status
            const [currentAppointment] = await pool.query(
                'SELECT * FROM appointment WHERE id = ?',
                [id]
            );
            
            if (currentAppointment.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return { error: 'Appointment not found' };
            }
            
            if (currentAppointment[0].status === 'cancelled') {
                console.log('⚠️ Cannot update cancelled appointment with ID:', id);
                return { error: 'Cannot update cancelled appointment' };
            }
            
            if (updateData.appointment_time) {
                // Parse and validate appointment time
                let appointmentDate;
                try {
                    appointmentDate = new Date(updateData.appointment_time);
                    
                    // Check if date is valid
                    if (isNaN(appointmentDate.getTime())) {
                        console.log('⚠️ Invalid appointment time format:', updateData.appointment_time);
                        return { error: 'Invalid appointment time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)' };
                    }
                    
                    // Check if appointment is in the future
                    const now = new Date();
                    if (appointmentDate <= now) {
                        console.log('⚠️ Appointment time must be in the future:', updateData.appointment_time);
                        return { error: 'Appointment time must be in the future' };
                    }
                    
                    // Format appointment_time for MySQL
                    updateData.appointment_time = appointmentDate.toISOString().slice(0, 19).replace('T', ' ');
                    
                } catch (error) {
                    console.log('⚠️ Error parsing appointment time:', error);
                    return { error: 'Invalid appointment time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)' };
                }
                
                // Map JavaScript day number to day name for string comparison
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = dayNames[appointmentDate.getDay()];
                const appointmentTimeStr = appointmentDate.toTimeString().slice(0, 8);
                
                console.log('🔍 Checking availability with:', {
                    coach_id: currentAppointment[0].coach_id,
                    dayName,
                    appointmentTimeStr,
                    date: appointmentDate
                });
                
                // Check if new time is within coach's availability
                const [availabilityRows] = await pool.query(
                    `SELECT id FROM coach_availability 
                     WHERE coach_id = ? 
                     AND day_of_week = ?
                     AND ? BETWEEN start_time AND end_time`,
                    [currentAppointment[0].coach_id, dayName, appointmentTimeStr]
                );
                
                if (availabilityRows.length === 0) {
                    console.log('⚠️ New appointment time not within coach availability');
                    return { error: 'New appointment time not within coach availability' };
                }
                
                // Check for conflicts with other appointments
                const duration = updateData.duration_minutes || currentAppointment[0].duration_minutes;
                const appointmentEndTime = new Date(appointmentDate);
                appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + duration);
                
                const [conflictRows] = await pool.query(
                    `SELECT id FROM appointment
                     WHERE coach_id = ?
                     AND id != ?
                     AND status != 'cancelled'
                     AND (
                        (appointment_time <= ? AND DATE_ADD(appointment_time, INTERVAL duration_minutes MINUTE) > ?)
                        OR
                        (appointment_time < ? AND DATE_ADD(appointment_time, INTERVAL duration_minutes MINUTE) >= ?)
                        OR
                        (appointment_time >= ? AND appointment_time < ?)
                     )`,
                    [currentAppointment[0].coach_id, id, appointmentEndTime, appointmentDate, appointmentEndTime, appointmentDate, appointmentDate, appointmentEndTime]
                );
                
                if (conflictRows.length > 0) {
                    console.log('⚠️ New appointment time conflicts with existing appointment');
                    return { error: 'New appointment time conflicts with existing appointment' };
                }
            }
            
            // Build update query dynamically
            const allowedFields = ['appointment_time', 'duration_minutes', 'status'];
            const updates = [];
            const values = [];
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    values.push(updateData[field]);
                }
            }
            
            if (updates.length === 0) {
                console.log('⚠️ No valid fields to update');
                return { error: 'No valid fields to update' };
            }
            
            values.push(id);
            
            // Execute update query
            const [result] = await pool.query(
                `UPDATE appointment SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
            
            if (result.affectedRows === 0) {
                console.log('❌ Failed to update appointment ID:', id);
                return { error: 'Failed to update appointment' };
            }
            
            // Get the updated appointment
            const [updatedRows] = await pool.query(
                `SELECT a.*, 
                        u_coach.full_name as coach_name, 
                        u_coach.profile_image as coach_avatar,
                        u_user.full_name as user_name,
                        u_user.profile_image as user_avatar
                 FROM appointment a
                 JOIN users u_coach ON a.coach_id = u_coach.id
                 JOIN users u_user ON a.user_id = u_user.id
                 WHERE a.id = ?`,
                [id]
            );
            
            console.log('✅ Successfully updated appointment ID:', id);
            return updatedRows[0];
        } catch (error) {
            console.error('❌ Error updating appointment:', error);
            throw error;
        }
    }
    
    /**
     * Delete an appointment
     * @param {number} id - The appointment ID
     * @returns {boolean} Success indicator
     */
    static async delete(id) {
        try {
            console.log('🔍 Deleting appointment ID:', id);
            
            const [result] = await pool.query(
                'DELETE FROM appointment WHERE id = ?',
                [id]
            );
            
            if (result.affectedRows === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return false;
            }
            
            console.log('✅ Successfully deleted appointment ID:', id);
            return true;
        } catch (error) {
            console.error('❌ Error deleting appointment:', error);
            throw error;
        }
    }
    
    /**
     * Cancel an appointment
     * @param {number} id - The appointment ID
     * @returns {Object} The cancelled appointment
     */
    static async cancel(id) {
        try {
            console.log('🔍 Cancelling appointment ID:', id);
            
            // Check if the appointment exists and is not already cancelled
            const [currentAppointment] = await pool.query(
                'SELECT * FROM appointment WHERE id = ?',
                [id]
            );
            
            if (currentAppointment.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return { error: 'Appointment not found' };
            }
            
            if (currentAppointment[0].status === 'cancelled') {
                console.log('⚠️ Appointment already cancelled with ID:', id);
                return { error: 'Appointment already cancelled' };
            }
            
            // Update status to cancelled
            const [result] = await pool.query(
                'UPDATE appointment SET status = ? WHERE id = ?',
                ['cancelled', id]
            );
            
            if (result.affectedRows === 0) {
                console.log('❌ Failed to cancel appointment ID:', id);
                return { error: 'Failed to cancel appointment' };
            }
            
            // Get the updated appointment
            const [updatedRows] = await pool.query(
                `SELECT a.*, 
                        u_coach.full_name as coach_name, 
                        u_coach.profile_image as coach_avatar,
                        u_user.full_name as user_name,
                        u_user.profile_image as user_avatar
                 FROM appointment a
                 JOIN users u_coach ON a.coach_id = u_coach.id
                 JOIN users u_user ON a.user_id = u_user.id
                 WHERE a.id = ?`,
                [id]
            );
            
            console.log('✅ Successfully cancelled appointment ID:', id);
            return updatedRows[0];
        } catch (error) {
            console.error('❌ Error cancelling appointment:', error);
            throw error;
        }
    }
    
    /**
     * Add a rating and feedback for an appointment
     * @param {number} id - The appointment ID
     * @param {Object} ratingData - Rating and feedback data
     * @returns {Object} The rating data with ID
     */
    static async addRating(id, ratingData) {
        try {
            console.log('🔍 Adding rating for appointment ID:', id, 'with data:', ratingData);
            
            // Check if the appointment exists and is completed
            const [appointmentRows] = await pool.query(
                'SELECT * FROM appointment WHERE id = ?',
                [id]
            );
            
            if (appointmentRows.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return { error: 'Appointment not found' };
            }
            
            const appointment = appointmentRows[0];
            
            if (appointment.status !== 'completed') {
                console.log('⚠️ Cannot rate an appointment that is not completed, ID:', id);
                return { error: 'Can only rate completed appointments' };
            }
            
            // Check if rating already exists for this appointment
            const [existingRatings] = await pool.query(
                'SELECT id FROM feedback WHERE coach_id = ? AND smoker_id = ?',
                [appointment.coach_id, appointment.user_id]
            );
            
            const { rating, content } = ratingData;
            
            let result;
            if (existingRatings.length > 0) {
                // Update existing rating
                [result] = await pool.query(
                    'UPDATE feedback SET rating = ?, content = ?, created_at = NOW() WHERE coach_id = ? AND smoker_id = ?',
                    [rating, content, appointment.coach_id, appointment.user_id]
                );
            } else {
                // Create new rating
                [result] = await pool.query(
                    'INSERT INTO feedback (coach_id, smoker_id, rating, content) VALUES (?, ?, ?, ?)',
                    [appointment.coach_id, appointment.user_id, rating, content]
                );
            }
            
            if (!result || (result.affectedRows === 0 && !existingRatings.length)) {
                console.log('❌ Failed to add rating for appointment ID:', id);
                return { error: 'Failed to add rating' };
            }
            
            // Get the created/updated feedback
            const [feedbackRows] = await pool.query(
                'SELECT * FROM feedback WHERE coach_id = ? AND smoker_id = ?',
                [appointment.coach_id, appointment.user_id]
            );
            
            console.log('✅ Successfully added rating for appointment ID:', id);
            return feedbackRows[0];
        } catch (error) {
            console.error('❌ Error adding rating:', error);
            throw error;
        }
    }
}

export default Appointment;
