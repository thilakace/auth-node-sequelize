module.exports = {
    "up": "CREATE TABLE user_sessions (id INT NOT NULL AUTO_INCREMENT, UNIQUE KEY id (id), user_id INT NOT NULL, authentication_key varchar(255) NULL, token varchar(255) NULL,session_status INT NULL, createdAt datetime NOT NULL DEFAULT current_timestamp(), updatedAt datetime NOT NULL DEFAULT current_timestamp())",
    "down": "DROP TABLE user_sessions"
}