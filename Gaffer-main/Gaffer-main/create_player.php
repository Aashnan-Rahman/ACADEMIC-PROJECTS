<?php
	$playerid = $_POST['playerid'];
	$name = $_POST['name'];
	$height = $_POST['height'];
	$weight = $_POST['weight'];
	$dob = $_POST['dob'];
	//$gender = $_POST['gender'];
	//$availability = $_POST['availability'];
	$position = $_POST['position'];
	//$timetorecover = $_POST['timetorecover'];
	$kitno = $_POST['kitno'];
	$salary = $_POST['salary'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
	
		$stmt = $conn->prepare("insert into player_info values(?, ?, ?, ?, ?, 'y', ?, 0, ?, 'not_selected', ?)");
		$stmt->bind_param("isssssii",  $playerid, $name, $height, $weight, $dob, $position, $kitno, $salary);
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		$stmt1 = $conn->prepare("insert into player_data values(?, 0, 0, 0, 0, 0, 0)");
		$stmt1->bind_param("i", $playerid);
		$execval1 = $stmt1->execute();
		
		$c = hash_init("md5");
	hash_update($c, $playerid);
	//$copy_c = hash_copy($c);
	//echo hash_final($c);
	//hash_update($copy_c, "content");
	$pass = hash_final($c);
		$stmt2 = $conn->prepare("insert into login_table (username, password, type) values(?, ?, 'player')");
		$stmt2->bind_param("ss", $playerid,$pass);
		$execval2 = $stmt2->execute();
		
		$stmt->close();
		$stmt1->close();
		$stmt2->close();
		$conn->close();
	}
	header('Location: ./create_player.html');
?>