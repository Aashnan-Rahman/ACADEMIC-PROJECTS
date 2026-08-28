const { Client } = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'containers-us-west-28.railway.app',
  database: 'railway',
  password: 'ssxHkalpuDlPHt3valTV',
  port: 6311,
})
client.connect();
client.query('select * from gaffer',(err,res)=>{
  if(!err){
    //console.log(res.rows);
    console.log(res.rows[1]);
    //const row = res.rows;
    
  }
  else{
    console.log("Error occured: "+err.message);
  }
  client.end;
})

