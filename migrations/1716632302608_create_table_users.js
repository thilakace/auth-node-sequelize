module.exports = {
    "up": "CREATE TABLE users (id INT NOT NULL AUTO_INCREMENT, UNIQUE KEY id (id), name varchar(255) NOT NULL, email varchar(255) NOT NULL, password TEXT,role_id INT, status INT, PRIMARY KEY (id), authentication_key varchar(255) NULL, lock_user INT, createdAt datetime NOT NULL DEFAULT current_timestamp(), updatedAt datetime NOT NULL DEFAULT current_timestamp())",
    "down": "DROP TABLE users"
}