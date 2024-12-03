const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173","https://doctorhouse-259ce.web.app", "https://doctorhouse-259ce.firebaseapp.com"],
  })
);

const { MongoClient, ServerApiVersion, Db, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrkijcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const uri = 'mongodb://localhost:27017/?directConnection=true'

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const CollectionOfDoctors = client
    .db("DoctorsHouseDB")
    .collection("DoctorsDB");
  const CollectionOfReviews = client
    .db("DoctorsHouseDB")
    .collection("ReviewDB");
  const CollectionOfAppointment = client
    .db("DoctorsHouseDB")
    .collection("AppointmentDB");
  const CollectionOfNewAppointment = client
    .db("DoctorsHouseDB")
    .collection("NewAppointmentDB");
  const CollectionOfUsers = client.db("DoctorsHouseDB").collection("UsersDB");
  const CollectionOfRequestUsers = client.db("DoctorsHouseDB").collection("RequestUsersDB");

  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // verify token
    const verifyToken = (req, res, next) => {
      // console.log("inside verify token", req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      // console.log(token);
      jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
          res.status(401).send({ message: "unauthorized access" });
        }
        req.decoded = decoded;
        next();
      });
    };
    // use verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email
      const query = { email: email }
      const user = await CollectionOfUsers.findOne(query)
      const isAdmin = user?.role === "admin"
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    // create jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // doctors related api
    app.get("/doctors", async (req, res) => {
      const doctor = req.body;
      const result = await CollectionOfDoctors.find(doctor).toArray();
      res.send(result);
    });

    app.post("/doctors", verifyToken, verifyAdmin, async (req, res) => {
      const doctor = req.body;
      const result = await CollectionOfDoctors.insertOne(doctor);
      res.send(result);
    });

    app.get("/doctors/:id", verifyToken, verifyAdmin, async (req, res) => {
      const DoctorId = req.params.id;
      const query = { _id: new ObjectId(DoctorId) };
      const result = await CollectionOfDoctors.findOne(query);
      res.send(result);
    });

    app.delete("/doctors/:id", verifyToken, verifyAdmin,  async (req, res) => {
      const DoctorId = req.params.id;
      const query = { _id: new ObjectId(DoctorId) };
      const result = await CollectionOfDoctors.deleteOne(query);
      res.send(result);
    });

    // review related api
    app.get("/reviews", async (req, res) => {
      const review = req.body;
      const result = await CollectionOfReviews.find(review).toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await CollectionOfReviews.insertOne(review);
      res.send(result);
    });

    // appointment first related api show in ui or appointment page
    app.get("/appointments", async (req, res) => {
      const appointment = req.body;
      const result = await CollectionOfAppointment.find(appointment).toArray()
      res.send(result);
    });
    app.get("/appointments/:id", async (req, res) => {
      const appId = req.params.id;
      const filter = { _id: new ObjectId(appId) };
      const result = await CollectionOfAppointment.findOne(filter);
      res.send(result);
    });

    // new appointment related api
    app.post("/Newappointments", async (req, res) => {
      const appointment = req.body;
      const result = await CollectionOfNewAppointment.insertOne(appointment);
      res.send(result)
    });

    app.get("/Newappointments", verifyToken,  async (req, res) => {
      const user = req.query.email;
      const query = { email: user };
      const result = await CollectionOfNewAppointment.find(query).toArray()
      res.send(result)
     
    });
    
    app.get("/Newappointments/:id", verifyToken, async (req, res) => {
      const appId = req.params.id;
      const filter = { _id: new ObjectId(appId) };
      const result = await CollectionOfNewAppointment.findOne(filter);
      res.send(result);
    });


    // user send message or request api
    app.post("/userRequest", async(req,res)=>{
      const user = req.body
      const result = await CollectionOfRequestUsers.insertOne(user)
      res.send(result)
    })

    // show user in request page or ui
    app.get('/userRequest', verifyToken, async(req,res)=>{
      const user = req.body
      const result = await CollectionOfRequestUsers.find(user).toArray()
      res.send(result)
    })

    // user send in database realted api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exiting = await CollectionOfUsers.findOne(query);
      if (exiting) {
        return res.send({ message: "User Already Exit" });
      }
      const result = await CollectionOfUsers.insertOne(user);
      res.send(result);
    });

    // show user in ui or all user page
    app.get("/users", verifyToken,  async (req, res) => {
      const user = req.body;
      const result = await CollectionOfUsers.find(user).toArray();
      res.send(result);
    });

    // delete user in database 
    app.delete('/users/:id', verifyToken, verifyAdmin, async(req,res)=>{
      const useId = req.params.id
      const filter = {_id: new ObjectId(useId)}
      const result = CollectionOfUsers.deleteOne(filter)
      res.send(result)
    })

    // make admin related api
    app.patch("/user/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await CollectionOfUsers.updateOne(filter, updateDoc);
      res.send(result);
    });

    // checked user make admin or none admin
    app.get("/user/admin/:email", verifyToken,  async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const filter = { email: email };
      const user = await CollectionOfUsers.findOne(filter);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is connecting");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
