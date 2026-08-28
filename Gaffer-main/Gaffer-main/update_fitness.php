<?php
	$playerid = $_POST['playerid'];
	$fitness = $_POST['fitness'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$fitness";
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("update player_info set availability = (?) where playerid = (?)");
		$stmt->bind_param("si", $fitness, $playerid);
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		$stmt->close();
		$conn->close();
	}
	header('Location: ./fitness1.php');
?>