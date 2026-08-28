<?php
	$playerid = $_POST['playerid'];
	$goal = $_POST['goal'];
	$assist = $_POST['assist'];
	$rcard = $_POST['rcard'];
	$ycard = $_POST['ycard'];
	$rating = $_POST['rating'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		//echo "$fitness";
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("update player_data set matches = matches + 1, goal = goal + (?), assist = assist + (?),
		rcard =rcard +(?), ycard=ycard+(?), rating= (rating+(?) )/2.0 where playerid = (?)");
		$stmt->bind_param("iiiidi", $goal, $assist, $rcard, $ycard, $rating, $playerid);
		$execval = $stmt->execute();
		echo $execval;
		//echo "Updated successfully...";
		$stmt->close();
		$conn->close();
	}
	header('Location: ./player_update.html');
?>