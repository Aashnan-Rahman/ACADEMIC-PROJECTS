<?php
	$playerid = $_POST['playerid'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
	
		$stmt = $conn->prepare("delete from player_info where playerid= (?)");
		$stmt->bind_param("i",  $playerid);
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		$stmt1 = $conn->prepare("delete from login_table where username= (?)");
		$stmt1->bind_param("i", $playerid);
		$execval1 = $stmt1->execute();
		
		$stmt2 = $conn->prepare("delete from player_data where playerid= (?)");
		$stmt2->bind_param("i", $playerid);
		$execval2 = $stmt2->execute();
		
		//$stmt2 = $conn->prepare("insert into login_table (username, password, type) values(?, ?, 'player')");
		//$stmt2->bind_param("ii", $playerid,$playerid);
		//$execval2 = $stmt2->execute();
		
		$stmt->close();
		$stmt1->close();
		$stmt2->close();
		$conn->close();
	}
	header('Location: ./deleted.html');
?>