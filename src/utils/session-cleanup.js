import db from '../models/db.js';

/**
 * Removes expired sessions
 */
const cleanupExpiredSessions = async () => {
    try {
        const result = await db.query(
            `DELETE FROM session WHERE expire < NOW()`
        );

        if (result.rowCount > 0) {
            console.log(`Cleaned up ${result.rowCount} expired sessions`);
        }
    } catch (error) {
        // Session table doesn't exist
        if (error.code === '42P01') {
            console.log(
                'Session table does not exist yet:\n→ It will be created when the first session is initialized'
            );
            return;
        }

        console.error('Error cleaning up session:', error);
    }
};

/**
 * Starts automatic session cleanup that runs every 12 hours
 */
const startSessionCleanup = () => {
    // Run immediately on start up
    cleanupExpiredSessions();

    // Run every 12 hours
    const twelveHours = 12 * 60 * 60 * 1000;

    setInterval(cleanupExpiredSessions, twelveHours);

    console.log('Session cleanup scheduled to run every 12 hours');
};

export { startSessionCleanup };