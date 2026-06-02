import bcrypt from "bcrypt";
import db from "../db.js";

const findUserByEmail = async (email) => {
    const query = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.password,
            u.created_at,
            u.role_id,
            r.role_name
        FROM users u
        LEFT JOIN roles r
            ON u.role_id = r.id
        WHERE LOWER(u.email) = LOWER($1)
        LIMIT 1
    `;

    const result = await db.query(query, [email]);

    return result.rows[0] || null;
};

const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export { findUserByEmail, verifyPassword };