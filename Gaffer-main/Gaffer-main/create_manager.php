<?php
	$managerid = $_POST['managerid'];
	$name = $_POST['name'];
	$specialist = $_POST['specialist'];
	$age = $_POST['age'];
	$exp = $_POST['exp'];
	$dob = $_POST['dob'];
	$gender = $_POST['gender'];
	$salary = $_POST['salary'];

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("insert into manager_info values(?, ?, ?, ?, ?, ?, ?, ?)");
		$stmt->bind_param("issiissi", $managerid, $name, $specialist, $age, $exp, $dob, $gender, $salary);
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		
		$c = hash_init("md5");
	hash_update($c, $managerid);
	//$copy_c = hash_copy($c);
	//echo hash_final($c);
	//hash_update($copy_c, "content");
	$pass = hash_final($c);
		
		$stmt2 = $conn->prepare("insert into login_table (username, password, type) values(?, ?, 'manager')");
		$stmt2->bind_param("ss", $managerid,$pass);
		$execval2 = $stmt2->execute();
		$stmt2->close();
		$stmt->close();
		
		$conn->close();
	}
	header('Location: ./create_manager.html');
?>