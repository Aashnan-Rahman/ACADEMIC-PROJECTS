<?php
	$ownerid = $_POST['ownerid'];
	$name = $_POST['name'];
	$amount = $_POST['amount'];
	$total = $_POST['total'];
	$dob = $_POST['dob'];
	$gender = $_POST['gender'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("insert into owner_info values(?, ?, ?, ?, ?, ?)");
		$stmt->bind_param("isiiss", $ownerid, $name, $amount, $total, $dob, $gender);
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		
		$c = hash_init("md5");
	hash_update($c, $ownerid);
	//$copy_c = hash_copy($c);
	//echo hash_final($c);
	//hash_update($copy_c, "content");
	$pass = hash_final($c);
		
		$stmt2 = $conn->prepare("insert into login_table (username, password, type) values(?, ?, 'owner')");
		$stmt2->bind_param("ss", $ownerid,$pass);
		$execval2 = $stmt2->execute();
		$stmt2->close();
		
		$stmt->close();
		$conn->close();
	}
	header('Location: ./create_owner.html');
?>