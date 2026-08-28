var attempt = 3; // Variable to count number of attempts.
// Below function Executes on click of login button.
function validate(){
var username = document.getElementById("username").value;
var password = document.getElementById("password").value;
if ( username == "admin" && password == "admin"){
alert ("Login successfully");
window.location = "/Users/sanz/Documents/Code/Project/what.html"; // Redirecting to other page.
return false;
}
else if ( username == "manager" && password == "manager"){
alert ("Login successfully");
window.location = "/Users/sanz/Documents/Code/Project/manager.html"; // Redirecting to other page.
return false;
}
else if ( username == "physio" && password == "physio"){
alert ("Login successfully");
window.location = "/Users/sanz/Documents/Code/Project/physio.html"; // Redirecting to other page.
return false;
}
else if ( username == "player" && password == "player"){
alert ("Login successfully");
window.location = "/Users/sanz/Documents/Code/Project/player.html"; // Redirecting to other page.
return false;
}
else{
attempt --;// Decrementing by one.
alert("Wrong Password! You have left "+attempt+" attempts");
// Disabling fields after 3 attempts.
if( attempt == 0){
document.getElementById("username").disabled = true;
document.getElementById("password").disabled = true;
document.getElementById("submit").disabled = true;
return false;
}
}
}