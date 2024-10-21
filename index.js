const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const port =  process.env.PORT || 5000;

// Middleware to parse JSON request bodies

app.use(express.json());
app.use(
    cors({
      origin: ["http://localhost:5173"],
    })
  );


  
  
const { MongoClient, ServerApiVersion, Db, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrkijcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const uri = 'mongodb://localhost:27017/?directConnection=true'


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  const CollectionOfDoctors = client.db("DoctorsHouseDB").collection("DoctorsDB")
  const CollectionOfReviews = client.db("DoctorsHouseDB").collection("ReviewDB")
  const CollectionOfAppointment = client.db("DoctorsHouseDB").collection("AppointmentDB")
  const CollectionOfNewAppointment = client.db("DoctorsHouseDB").collection("NewAppointmentDB")
  const CollectionOfUsers = client.db("DoctorsHouseDB").collection("UsersDB")


  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // doctors api
    app.get('/doctors',async (req,res)=>{
      const doctor = req.body
      const result = await CollectionOfDoctors.find(doctor).toArray()
      res.send(result)
    })

    app.post('/doctors', async(req,res)=>{
      const doctor = req.body
      const result = await CollectionOfDoctors.insertOne(doctor)
      res.send(result)
    })

    app.get('/doctors/:id', async(req,res)=>{
      const DoctorId = req.params.id
      const query = {_id: new ObjectId(DoctorId)}
      const result = await CollectionOfDoctors.findOne(query)
      res.send(result) 
    })

    app.delete('/doctors/:id', async(req,res)=>{
      const DoctorId = req.params.id
      const query = {_id: new ObjectId(DoctorId)}
      const result = await CollectionOfDoctors.deleteOne(query)
      res.send(result)
    })

    // review api
    app.get('/reviews', async(req,res)=>{
      const review = req.body
      const result = await CollectionOfReviews.find(review).toArray()
      res.send(result)
    })

    app.post('/reviews', async(req,res)=>{
      const review = req.body
      const result = await CollectionOfReviews.insertOne(review)
      res.send(result)
    })

    // appointment api
    app.get('/appointments', async(req,res)=>{
      const appointment = req.body
      const result = await CollectionOfAppointment.find(appointment).toArray()
      res.send(result)
    })
    app.get('/appointments/:id', async(req,res)=>{
      const appId = req.params.id
      const filter = {_id: new ObjectId(appId)}
      const result = await CollectionOfAppointment.findOne(filter)
      res.send(result)
    })

    // new appointment api
    app.post('/Newappointments', async(req,res)=>{
      const appointment = req.body
      const result = await CollectionOfNewAppointment.insertOne(appointment)
    })

    app.get('/Newappointments', async(req,res)=>{
      const appointment = req.body
      const result = await CollectionOfNewAppointment.find(appointment).toArray()
      res.send(result)
    })
    app.get('/Newappointments/:id', async(req,res)=>{
      const appId = req.params.id
      const filter = {_id: new ObjectId(appId)}
      const result = await CollectionOfNewAppointment.findOne(filter)
      res.send(result)
    })

    // user api
    app.post('/users', async(req,res)=>{
      const user = req.body
      const query = {email: user.email}
      const exiting = await CollectionOfUsers.findOne(query)
      if(exiting){
        return res.send({message: 'User Already Exit'})
      }
      const result = await CollectionOfUsers.insertOne(user)
      res.send(result)
    })


    app.get('/users', async(req,res)=>{
      const user = req.body
      const result = await CollectionOfUsers.find(user).toArray()
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res)=>{
    res.send("server is connecting")
})

app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
})

