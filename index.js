const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dysamrx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("wheelieworld").collection("toyCollections");
    // const myToyCollection = client.db("wheelieworld").collection("mytoycollection")

    app.get("/products", async(req, res) => {
        const result = await toyCollection.find().toArray();
        res.send(result);
    })

    app.get("/products/:id", async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await toyCollection.findOne(query);
      res.send(result);
    })

    app.get("/myToys", async(req, res) => {
      let query = {};
      console.log(req.query.email);
      if(req.query?.email){
        query = {seller_email: req.query.email}
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    })
    
    app.post("/myToys", async(req, res) => {
      const myToy = req.body;
      const result = await toyCollection.insertOne(myToy);
      res.send(result);
    })

    app.delete("/myToys/:id", async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await toyCollection.deleteOne(query);
      res.send(result);
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


app.get("/", (req, res) => {
    res.send("Wheelie World server is running");
})

app.listen(port, () => {
    console.log(`Wheelie World server is running on port: ${port}`);
})