# Parking Management System

This is a full-stack Parking Management System with a Node.js/Express backend, a MySQL database, and an HTML/CSS/JavaScript frontend.

## Prerequisites

*   **Node.js** (v14 or higher)
*   **MySQL Server** (v8.0 recommended)

## Setup Instructions

### 1. Database Setup

1.  **Start MySQL:** Ensure your MySQL server is running.
2.  **Create the Database:**
    Open your terminal and log in to MySQL:
    ```bash
    mysql -u root -p
    ```
    Run the following command to create the database:
    ```sql
    CREATE DATABASE parking_db;
    EXIT;
    ```

3.  **Load Schema and Data:**
    Navigate to the project root directory and import the SQL files:
    ```bash
    # Import the schema (creates tables)
    mysql -u root -p parking_db < create.sql

    # Import initial data (users, zones, etc.)
    mysql -u root -p parking_db < load.sql
    ```

### 2. Backend Configuration

1.  Navigate to the backend directory:
    ```bash
    cd "Databases PM/parking-backend"
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `parking-backend` directory (if it doesn't exist) and add your database credentials:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password_here
    DB_NAME=parking_db
    ```
    *Replace `your_mysql_password_here` with your actual MySQL root password.*

### 3. Running the Application

1.  **Start the Server:**
    From the `parking-backend` directory, run:
    ```bash
    node server.js
    ```
    You should see:
    ```
    🚀 Server running on http://localhost:3000
    📁 Serving frontend from: ...
    ✅ Database connected successfully
    ```

2.  **Access the App:**
    Open your web browser and go to:
    [http://localhost:3000](http://localhost:3000)

## Usage

### Default Login Credentials

You can log in with any of the following pre-configured users:

| Role | User ID (UID) | Password |
| :--- | :--- | :--- |
| **Student** | `john.doe` | `password123` |
| **Staff** | `jane.smith` | `password123` |
| **Visitor** | `bob.johnson` | `password123` |

### Features
*   **Sign Up:** Create a new account with a specific role.
*   **Dashboard:** Central hub for user actions.
*   **View Citations:** Check parking citations (currently static data).
*   **Navigation:** Seamless routing between pages.

## Project Structure

*   **`create.sql`**: Database schema definition.
*   **`load.sql`**: Initial seed data.
*   **`Databases PM/parking-backend/`**: Node.js Express server.
*   **`Databases PM/parking-frontend/`**: Static HTML/CSS/JS frontend files.
