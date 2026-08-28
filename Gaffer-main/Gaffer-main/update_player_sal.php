<?php
	$playerid = $_POST['playerid'];
	$salary = $_POST['salary'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		//echo "$fitness";
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("update player_info set salary = (?) where playerid = (?)");
		$stmt->bind_param("ii", $salary, $playerid);
		$execval = $stmt->execute();
		echo $execval;
		//echo "Registration successfully...";
		$stmt->close();
		$conn->close();
	}
	header('Location: ./update_player_sal.html');
?>