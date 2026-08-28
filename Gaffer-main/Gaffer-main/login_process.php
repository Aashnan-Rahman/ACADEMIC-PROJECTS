<?php session_start();

include('db_conn.php');

if(isset($_POST['login']));
{
    $user_unsafe=$_POST['username'];
    $pass_unsafe=$_POST['password'];

    $user = mysqli_real_escape_string($con,$user_unsafe);
    $pass = mysqli_real_escape_string($con,$pass_unsafe);
	$c = hash_init("md5");
	hash_update($c, $pass);
	//$copy_c = hash_copy($c);
	//echo hash_final($c);
	//hash_update($copy_c, "content");
	$pass = hash_final($c);
	

    $query=mysqli_query($con,"select * from login_table where username='$user' and password='$pass'")or die(mysqli_error($con));

    $row=mysqli_fetch_array($query);

         $name=$row['username'];
         $counter=mysqli_num_rows($query);
         $id=$row['id'];
		 $type=$row['type'];

         if ($counter == 0)
         {
            echo "<script type='text/javascript'>alert('Invalid Usrename or Password!');
            document.location='login.html'</script>";
         }
         else
         {
			 if($type == 'admin'){
            $_SESSION['id']=$id;
            $_SESSION['username']=$name;

            echo "<script type='text/javascript'>document.location='what.html'</script>";
			 }
			 elseif($type == 'manager'){
            $_SESSION['id']=$id;
            $_SESSION['username']=$name;

            echo "<script type='text/javascript'>document.location='manager.html'</script>";
			 }
			 elseif($type == 'owner'){
            $_SESSION['id']=$id;
            $_SESSION['username']=$name;

            echo "<script type='text/javascript'>document.location='owner.html'</script>";
			 }
			 
			  elseif($type == 'physio'){
            $_SESSION['id']=$id;
            $_SESSION['username']=$name;

            echo "<script type='text/javascript'>document.location='physio.html'</script>";
			 }
			 
			 elseif($type == 'player'){
            $_SESSION['id']=$id;
            $_SESSION['username']=$name;

            echo "<script type='text/javascript'>document.location='player.php'</script>";
			 }
         }

}

?>