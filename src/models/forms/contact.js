import db from "../db.js";

/**
 * Inserts a new contact form submission into the database
 */
const createContactForm = async (subject, message, email = null) => {
    const query = `
        INSERT INTO contact_form (subject, message, email)
        VALUES ($1, $2, $3)
        RETURNING *
    ;`

    const result = await db.query(query, [subject, message, email]);
    return result.rows[0];
};

/**
 * Retrieves all contact form submissions
 */
const getAllContactForms = async () => {
    const query = `
        SELECT id, subject, message, email, submitted
        FROM contact_form
        ORDER BY submitted DESC
    `;

    const result = await db.query(query);

    return result.rows;
};

export { createContactForm, getAllContactForms };
