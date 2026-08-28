<?php
	$playerid = $_POST['playerid'];
	$name = $_POST['name'];
	$height = $_POST['height'];
	$weight = $_POST['weight'];
	$dob = $_POST['dob'];
	$gender = $_POST['gender'];
	$availability = $_POST['availability'];
	$position = $_POST['position'];
	$timetorecover = $_POST['timetorecover'];
	$kitno = $_POST['kitno'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("insert into player_info values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
		$stmt->bind_param("issssssssi", $playerid, $name, $height, $weight, $dob, $gender, $availability, $position, $timetorecover, $kitno);
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		$stmt->close();
		$conn->close();
	}
	header('Location: index.html');
?>