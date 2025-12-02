-- load data into Users table
INSERT INTO Users (first_name, last_name, email, uid, password_hash, phone_number, role) VALUES
('John', 'Doe', 'john.doe@email.com', 'john.doe', '$2a$10$EWCHlBNT.zK/6CMyHrh8Q.91W7uOlOhXKGxcTkk2Z/H0VExd3gV42', '555-0101', 'student'), -- password123
('Jane', 'Smith', 'jane.smith@email.com', 'jane.smith', '$2a$10$EWCHlBNT.zK/6CMyHrh8Q.91W7uOlOhXKGxcTkk2Z/H0VExd3gV42', '555-0102', 'staff'), -- password123
('Bob', 'Johnson', 'bob.johnson@email.com', 'bob.johnson', '$2a$10$EWCHlBNT.zK/6CMyHrh8Q.91W7uOlOhXKGxcTkk2Z/H0VExd3gV42', NULL, 'visitor'); -- password123

-- load data into Parking_Zone table
INSERT INTO Parking_Zone (zone_name, zone_level, location) VALUES
('Green Zone', '1', 'North Campus'),
('Red Zone', '2', 'Science Building'),
('Blue Zone', 'B1', 'Library Basement');

-- load data into Permit_Grade table
INSERT INTO Permit_Grade (grade_name, grade_price, expiration_date) VALUES
('Premium', 250.00, '2025-08-31'),
('Staff', 150.00, '2026-06-30'),
('Visitor', 10.00, '2025-12-31');

-- load data into Vehicles table
INSERT INTO Vehicles (license_plate, model, color, user_id) VALUES
('ABC123', 'Toyota Camry', 'Blue', 1),
('XYZ789', 'Honda Civic', 'Red', 1),
('STAFF01', 'Ford Fusion', 'Black', 2);

-- load data into Permit table
INSERT INTO Permit (vehicle_id, grade_id, purchase_date) VALUES
(1, 1, '2024-09-01'),
(2, 3, '2024-09-15'),
(3, 2, '2024-08-20');

-- load data into Zone_Access table
INSERT INTO Zone_Access (grade_id, zone_id) VALUES
(1, 1),  -- Premium can access Green Zone
(1, 2),  -- Premium can access Red Zone  
(1, 3),  -- Premium can access Blue Zone
(2, 1),  -- Staff can access Green Zone
(2, 2),  -- Staff can access Red Zone
(3, 1);  -- Visitors can only access Green Zone