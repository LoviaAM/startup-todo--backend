import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client({
  user: "academy", 
  password: "",
  host: "localhost",
  port: 5432,
  database : "checklist",
}); // defines the client config 
client.connect();

// query for all values from the database
app.get("/", async (req, res) => {
  const dbres = await client.query('select * from checklist');
  res.json(dbres.rows);
});

// add user input 
app.post("/input", async (req,res )=>{
  try{
    const {tag, description}= req.body
    const newTodo = await client.query("INSERT INTO checklist (post_description, post_tag) VALUES ($1, $2)", [description, tag]
    );
    res.json(newTodo)
  }catch (err){
    console.log(err.message)
  }
});

// allow  user to delete post 
app.delete("post/:id", async (req,res)=> {
  try{
    const {id} = req.params;
    const deleteTodo = await client.query(
      "delete from checklist where post_id = $1",[id]
    );
    res.json("post deleted")
  }catch (err){
    console.log(err.message)
  }
})

// edit the post
app.put("/post/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const {description} = req.body;
    const editTodo = await client.query(
      "UPDATE checklist sert post_description = $1 where post_id = $2",[description, id]
    )
  } catch (err) {
    console.log(err.message)
  }
})

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
