<?php
	$matchid = $_POST['matchid'];
	$opponent = $_POST['opponent'];
	$date = $_POST['date'];
	$time = $_POST['time'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("insert into match_info values(?, ?, ?, ?)");
		$stmt->bind_param("isss", $matchid, $opponent, $date, $time);
		$execval = $stmt->execute();
		echo $execval;
		$stmt->close();
		
		$conn->close();
	}
	header('Location: ./create_match.html');
?>