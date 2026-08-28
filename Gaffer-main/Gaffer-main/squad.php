<!-- PHP code to establish connection with the localserver -->
<?php
 
$user = 'root';
$password = '';
$database = 'test';
$servername='localhost';
$mysqli = new mysqli($servername, $user,
                $password, $database);
// Checking for connections
if ($mysqli->connect_error) {
    die('Connect Error (' .
    $mysqli->connect_errno . ') '.
    $mysqli->connect_error);
}
$sql = " SELECT * FROM player_info";
$result = $mysqli->query($sql);
$mysqli->close();
?>
<!-- HTML code to display data in tabular format -->
<!DOCTYPE html>
<html lang="en">
 
<head>
<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
  <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous"><link rel="stylesheet" href="./what.css">
  
    <meta charset="UTF-8">
    <title>Player List</title>
    <style>
      <style>
        table {
            margin: 0 auto;
            font-size: small;
            border: 1px solid black;
        }
 
        h1 {
            text-align: center;
            color: #006600;
            font-size: small;
            font-family: 'Gill Sans', 'Gill Sans MT',
            ' Calibri', 'Trebuchet MS', 'sans-serif';
        }
 
        td {
            background-color: #E4F5D4;
            border: 1px solid black;
        }
 
        th,
        td {
            border: 1px solid black;
            padding: 1px;
            text-align: center;
        }
 
        td {
            font-weight: lighter;
        }
		.topnav {
    background-color: #333;
    overflow: hidden;
}

/* Style the links inside the navigation bar */
.topnav a {
  float: left;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
}

/* Change the color of links on hover */
.topnav a:hover {
  background-color: #ddd;
  color: black;
}

/* Add a color to the active/current link */
.topnav a.active {
  background-color: #04AA6D;
  color: white;
}

/* Right-aligned section inside the top navigation */
.topnav-right {
  float: right;
}
    </style>
</head>
 
<body>
 <div class="topnav">
  <a class="active" href="./what.html">Home</a>
  <a href="#news">Infomation</a>
  <a href="#contact">Contact</a>
  <div class="topnav-right">
    <a href="#search">Search</a>
    <a href="./logout_process.php">Logout</a>
  </div>
</div>
    <section>
        <h1>Players</h1>
        <!-- TABLE CONSTRUCTION -->
       <center> <table>
            <tr>
                <th>Player ID</th>
                <th>Name</th>
                <th>Height(cm)</th>
                <th>Weight(kg)</th>
				<th>Date of Birth</th>
				<th>Availability</th>
				<th>Position</th>
				<th>Kit no</th>
				<th>Salary</th>
            </tr>
            <?php
                while($rows=$result->fetch_assoc())
                {
            ?>
            <tr>
                <td><?php echo $rows['playerid'];?></td>
                <td><?php echo $rows['name'];?></td>
                <td><?php echo $rows['height'];?></td>
                <td><?php echo $rows['weight'];?></td>
				<td><?php echo $rows['dob'];?></td>
				<td><?php echo $rows['availability'];?></td>
				<td><?php echo $rows['position'];?></td>
				<td><?php echo $rows['kitno'];?></td>
				<td><?php echo $rows['salary'];?></td>
            </tr>
            <?php
                }
            ?>
        </table>
		</center>
    </section>
</body>
 
</html>