<?php
	$playerid = $_POST['var'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$fitness";
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$sql = " SELECT status FROM player_info where playerid = ". strval($playerid);
		$result = $conn->query($sql);
		$rows=$result->fetch_assoc();
		$val=$rows['status'];
		//$conn->close();
		if($val == 'not_selected'){
			$stmt = $conn->prepare("update player_info set status = 'selected' where playerid = (?)");
			$stmt->bind_param("i", $playerid);
			$execval = $stmt->execute();
			echo $execval;
			//echo "Registration successfully...";
			$stmt->close();
			$conn->close();
		}
		else 
		{
			$stmt = $conn->prepare("update player_info set status = 'not_selected' where playerid = (?)");
			$stmt->bind_param("i", $playerid);
			$execval = $stmt->execute();
			echo $execval;
			//echo "Registration successfully...";
			$stmt->close();
			$conn->close();
		}
	}
	header('Location: ./select_squad.php');
?>