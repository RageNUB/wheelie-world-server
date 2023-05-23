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
    // await client.connect();

    const toyCollection = client.db("wheelieworld").collection("toysCollections");

    app.get("/all-products", async (req, res) => {
      const result = await toyCollection.find().toArray();  
      res.send(result);

    })

    app.get("/products", async (req, res) => {
      const limit = 20;
      const page = parseInt(req.query?.page) || 1;
      const skip = (page - 1) * limit;
      const result = await toyCollection.find().skip(skip).limit(limit).toArray();
      res.send(result);
    })

    app.get("/product", async (req, res) => {
      const search = req.query.search;
      const query = {toy_name: { $regex: search, $options: "i"}};
      if(!search){
        const result = await toyCollection.find(query).skip(0).limit(20).toArray();
        res.send(result);
      } else {
        const result = await toyCollection.find(query).toArray();
        res.send(result);
      }
    })

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    })

    app.get("/category", async(req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { sub_category: req.query.category }
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    })

    app.get("/myToys", async (req, res) => {
      console.log(req.query)
      let query = {};
      if (req.query?.email) {
        query = { seller_email: req.query.email }
      }
      const ascendingSort = {
        sort: {price: 1}
      }
      const descendingSort = {
        sort: {price: -1}
      }
      if(req.query?.sort == 1){
        const result = await toyCollection.find(query, ascendingSort).toArray();
        res.send(result);
      } else {
        const result = await toyCollection.find(query,descendingSort).toArray();
        res.send(result);
      }
    })

    app.post("/myToys", async (req, res) => {
      const myToy = req.body;
      const result = await toyCollection.insertOne(myToy);
      res.send(result);
    });

    app.put("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          img: updatedToy.photo,
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.details
        }
      }
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    })

    app.delete("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
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