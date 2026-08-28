<?php
 session_start();
if(empty($_SESSION['id'])):
    header('Location:login.php');
endif;
$playerid=$_SESSION['username'];
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
$sql = " SELECT * FROM player_info where playerid = ". $playerid;
$result = $mysqli->query($sql);
$rows=$result->fetch_assoc();
//$mysqli->close();

$sql1 = " SELECT matches,goal,assist,rcard,ycard,rating FROM player_data where playerid = ". $playerid;
$result1 = $mysqli->query($sql1);

//foreach($reasult1 as $data)
$data=$result1->fetch_assoc();
  {
    $matches = $data['matches'];
    $goal = $data['goal'];
	$assist = $data['assist'];
	$rcard = $data['rcard'];
	$ycard = $data['ycard'];
  }




$sql2 = " SELECT * FROM match_info ";
$result2 = $mysqli->query($sql2);
//$rows2=$result2->fetch_assoc();

$mysqli->close();
?>

<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>Player Dashboard</title>
  
  <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
  <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous"><link rel="stylesheet" href="./player.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  </head>
<body>

 <div class="topnav">
  <a class="active" href="#home">Home</a>
  <a href="#news">Infomation</a>
  <a href="#contact">Contact</a>
  <div class="topnav-right">
    <a href="#search">Search</a>
    <a href="./logout_process.php">Logout</a>
  </div>
</div>
  
<p id="demo"></p>

  <div class="container">
    <img src="./player.jpg" alt="player_football" class="image" width="1000" height="200" style="object-fit: cover;">
  <div class="overlay">Dashboard</div>
  <div class="center">WELCOME Player!</div>
</div>
<br>
<br>
<div class="row">
  <div class="column">
   <img src="./ronaldo.jpg" alt="Avatar" class="avatar" style="object-fit: cover;">
  </div>
  <div class="column" >
    <br>
    <br>
    <br>
  <h3>Name :&nbsp;<?php echo $rows['name'];?></h3>
  <h3>Date of Birth :&nbsp;<?php echo $rows['dob'];?></h3>
  <h3>Height :&nbsp;<?php echo $rows['height'];?> cm</h3>
  <h3>Weight :&nbsp;<?php echo $rows['weight'];?> kgs</h3>
  </div>
<div class="column">
   <br>
    <br>
    <br>
  <h3>Position :&nbsp;<?php echo $rows['position'];?></h3>
  <h3>Kit no. :&nbsp;<?php echo $rows['kitno'];?></h3>
  <h3>Salary :&nbsp;<?php echo $rows['salary'];?> $/year</h3>
  <h3>Fitness :&nbsp;<?php echo $rows['availability'];?></h3>
</div>
</div>

<div class="Name_table"><h2><center>Player stats</center></h2></div>
<center><table id="customers" style="width:80%">
  <tr>
    <td>Matches</td>
    <td>Goal</td>
    <td>Assist</td>
	<td>Yellow card</td>
	<td>Red card</td>
	<td>Rating</td>
  </tr>
<tr>
<td><label class="container"><?php echo $data['matches'];?></label></td>
  
<td><?php echo $data['goal'];?></td>
<td><?php echo $data['assist'];?></td>
<td><?php echo $data['ycard'];?></td>
<td><?php echo $data['rcard'];?></td>
<td><?php echo $data['rating'];?></td>
</tr>
</table>
</center>

<br><br>
<div class="Name_table"><h2><center>Upcoming Matches</center></h2></div>
<center><table id="customers" style="width:80%">
  <tr>
    <td>Opponent Team</td>
    <td>Date</td>
    <td>Time</td>
  </tr>
	<?php
		while($rows2=$result2->fetch_assoc())
		{
	?>
	<tr>
		<td><?php echo $rows2['opponent'];?></td>
        <td><?php echo $rows2['date'];?></td>
        <td><?php echo $rows2['time'];?></td>
	</tr>
	<?php
		}
	?>

</table>
</center>
<center>

<br>
<br>
<br>
</center>

<?php
	

//$matches=$rows1['matches'];
//$goal=$rows1['goal'];
//$assist=$rows1['assist'];
//$ycard=$rows1['ycard'];
//$rcard=$rows1['rcard'];
//echo shell_exec($matches);
//echo shell_exec($goal);
?>


<center>
<div style="width:100%;max-width:700px">
<canvas id="myChart"></canvas>
</div>
</center>
<script>
  // === include 'setup' then 'config' above ===
  
  const labels = ["Matches","Goal","Assist","Yellow card","Red card"];
  const data = {
    labels: labels,
    datasets: [{
      label: 'Player stats',
      data: [<?php echo json_encode($matches) ?>,<?php echo json_encode($goal) ?>,
	  <?php echo json_encode($assist) ?>,<?php echo json_encode($ycard) ?>,
	  <?php echo json_encode($rcard) ?>],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  };

  var myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
</script>

</body>
</html>
