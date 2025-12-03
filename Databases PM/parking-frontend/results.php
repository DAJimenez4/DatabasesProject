<?php
// Get user input
$uid = $_GET['uid'] ?? "";
$password = $_GET['password'] ?? "";

echo "<h2>Constructed SQL Query (Prepared Statement)</h2>";
echo "<pre>SELECT * FROM users WHERE uid = ? AND password = ?</pre>";

// Connect to database
$conn = new mysqli("localhost", "root", "", "parking_management");

// Prepare statement
$stmt = $conn->prepare("SELECT firstName, lastName, email, uid, role 
                        FROM users WHERE uid = ? AND password = ?");
$stmt->bind_param("ss", $uid, $password);
$stmt->execute();

// Fetch result
$result = $stmt->get_result();
$row = $result->fetch_assoc();

echo "<h2>Search Results</h2>";

if ($row) {
    echo "<p><strong>Name:</strong> {$row['firstName']} {$row['lastName']}</p>";
    echo "<p><strong>Email:</strong> {$row['email']}</p>";
    echo "<p><strong>U_ID:</strong> {$row['uid']}</p>";
    echo "<p><strong>Role:</strong> {$row['role']}</p>";
} else {
    echo "<p style='color:red;'>No matching user found.</p>";
}

echo "<p><a href='loginInfo.html'>Back to login</a></p>";

$stmt->close();
$conn->close();
?>

