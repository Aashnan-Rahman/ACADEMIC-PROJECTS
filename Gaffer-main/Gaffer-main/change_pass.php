<?php
	$username = $_POST['username'];
	$new_pass = $_POST['new_pass'];
	
	$c = hash_init("md5");
	hash_update($c, $new_pass);
	//$copy_c = hash_copy($c);
	//echo hash_final($c);
	//hash_update($copy_c, "content");
	$pass = hash_final($c);

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		//echo "$fitness";
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("update login_table set password = (?) where username = (?)");
		$stmt->bind_param("ss", $pass, $username);
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		$stmt->close();
		$conn->close();
	}
	header('Location: ./change_pass.html');
?>