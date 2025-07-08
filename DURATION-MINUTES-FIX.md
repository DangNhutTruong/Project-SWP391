# Appointment Schema Fix for duration_minutes

## Problem

The Appointment model code was encountering an error:
```
Unknown column 'duration_minutes' in 'where clause'
```

This error occurs because the `appointments` table in the database does not have the `duration_minutes` column that our code is trying to use in queries.

## Solution

1. Added the `duration_minutes` column to the `appointments` table
2. Updated queries to handle cases where `duration_minutes` might not exist using `IFNULL()`
3. Fixed a remaining reference to the incorrect `appointment` table (singular) in the update method

## Implementation Steps

1. **Run the fix script to add the duration_minutes column**:
   ```
   node server/add-duration-minutes.js
   ```
   This script will:
   - Add the `duration_minutes` column to the `appointments` table if it doesn't exist
   - Verify the table structure after the change

2. **Restart your server**:
   The changes to the model have been applied, but the server needs to be restarted to load them.

3. **Test Appointment Creation**:
   Try creating a new appointment using the API endpoint. It should now work correctly with the following payload:
   ```json
   {
     "coach_id": 4,
     "appointment_time": "2025-07-11T15:00:00",
     "duration_minutes": 60
   }
   ```

## Changes Made

1. **Created SQL script** (`server/src/scripts/add-duration-minutes.sql`):
   - Adds the missing `duration_minutes` column to the `appointments` table

2. **Updated Appointment Model** (`server/src/models/Appointment.js`):
   - Added `IFNULL(duration_minutes, 30)` to handle cases where the column might not exist
   - Fixed a query that was still using `appointment` table instead of `appointments`
   - Added `appointment_time` field in the result by concatenating `date` and `time`

3. **Updated Database Fix Script** (`server/src/scripts/fix-appointment-tables.sql`):
   - Explicitly included the `duration_minutes` column in the table creation script

## Troubleshooting

If you still encounter issues after implementing these fixes:

1. Make sure the `duration_minutes` column was added successfully:
   ```sql
   DESCRIBE appointments;
   ```

2. If the column is still missing, you can add it manually:
   ```sql
   ALTER TABLE appointments
   ADD COLUMN duration_minutes INT NOT NULL DEFAULT 30 COMMENT 'Duration in minutes' AFTER time;
   ```

3. Restart your server after making any changes to the database schema.
