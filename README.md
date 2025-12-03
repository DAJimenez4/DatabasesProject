# Parking Management System

## Prerequisites

*   **Node.js**
*   **MySQL Server**

## Setup Instructions

### 1. Backend Configuration

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

### 2. Database Setup

1.  **Start MySQL:** Ensure your MySQL server is running.

2.  **Initialize the Database:**
    Run the initialization script from the `parking-backend` directory. This script will **reset** the database (drop and recreate) and load the initial data.
    ```bash
    node init_db.js
    ```
    *Note: This command uses `create.sql` and `load.sql` from the project root.*

### 3. Running the Application

1.  **Start the Server:**
    From the `parking-backend` directory, run:
    ```bash
    node server.js
    ```
    You should see:
    ```
    Server running on http://localhost:3000
    Serving frontend from: ...
    Database connected successfully
    ```

2.  **Access the App:**
    Open your web browser and go to:
    [http://localhost:3000](http://localhost:3000)

## Usage

### Default Login Credentials

You can log in with any of the following pre-configured users:

| Role | User ID (UID) | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin` |
| **Student** | `john.doe` | `password123` |
| **Staff** | `jane.smith` | `password123` |
| **Visitor** | `bob.johnson` | `password123` |

### Features

#### User Features
*   **Sign Up/Login:** Secure authentication.
*   **Dashboard:** View your parking status.
*   **View Citations:** View and **pay** citations directly.
*   **Manage Vehicles:** Add, edit, and view your vehicles.
*   **Manage Permits:** Purchase and view parking permits.

#### Admin Features
*   **Admin Dashboard:** Overview of all citations.
*   **Manage Citations:** Create, edit, and delete citations.
*   **Citation Payment:** Mark citations as paid.

## Project Structure

*   **`create.sql`**: Database schema definition.
*   **`load.sql`**: Initial seed data.
*   **`Databases PM/parking-backend/`**: Node.js Express server.
    *   `server.js`: Main application logic.
    *   `init_db.js`: Database initialization script.
*   **`Databases PM/parking-frontend/`**: Static HTML/CSS/JS frontend files.
