-- Parking Management Database Creation Script
-- this script creates all tables with enforced foreign key relationships

-- create Users table (independent entity)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(30) NOT NULL UNIQUE,
    uid VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    role VARCHAR(20) NOT NULL
);

-- create Vehicles table with FOREIGN KEY relationship to Users
CREATE TABLE Vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(10) NOT NULL UNIQUE,
    model VARCHAR(30) NOT NULL,
    color VARCHAR(20) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- create Parking_Zone table (independent entity)
CREATE TABLE Parking_Zone (
    zone_id INT AUTO_INCREMENT PRIMARY KEY,
    zone_name VARCHAR(20) NOT NULL UNIQUE,
    zone_level VARCHAR(10),
    location VARCHAR(50)
);

-- create Permit_Grade table (independent entity)
CREATE TABLE Permit_Grade (
    grade_id INT AUTO_INCREMENT PRIMARY KEY,
    grade_name VARCHAR(20) NOT NULL UNIQUE,
    grade_price DECIMAL(5, 2) NOT NULL,
    expiration_date DATE NOT NULL
);

-- create Permit table with FOREIGN KEY relationships to Vehicles and Permit_Grade
CREATE TABLE Permit (
    permit_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT UNIQUE NOT NULL,
    grade_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (grade_id) REFERENCES Permit_Grade(grade_id) ON DELETE CASCADE
);

-- create Zone_Access junction table with COMPOSITE PRIMARY KEY and FOREIGN KEY relationships
CREATE TABLE Zone_Access (
    grade_id INT NOT NULL,
    zone_id INT NOT NULL,
    PRIMARY KEY (grade_id, zone_id),
    FOREIGN KEY (grade_id) REFERENCES Permit_Grade(grade_id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES Parking_Zone(zone_id) ON DELETE CASCADE
);