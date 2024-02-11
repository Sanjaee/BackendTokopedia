const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const ProductSchema = new mongoose.Schema({
  gambar: String,
  nama_product: String,
  harga: Number,
  deskripsi: String,
  rate: Number,
  category: String,
  createdat: { type: Date, default: Date.now },
  detailproduct: [
    {
      image: String,
    },
  ],
});

const Product = mongoose.model("Product", ProductSchema);

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const {
      gambar,
      nama_product,
      harga,
      deskripsi,
      rate,
      category,
      detailproduct,
    } = req.body;
    const newProduct = new Product({
      gambar,
      nama_product,
      harga,
      deskripsi,
      rate,
      category,
      detailproduct,
      createdat: new Date(),
    });

    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      gambar,
      nama_product,
      harga,
      deskripsi,
      rate,
      category,
      detailproduct,
    } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        gambar,
        nama_product,
        harga,
        deskripsi,
        rate,
        category,
        detailproduct,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function generateId() {
  try {
    const latestProduct = await Product.findOne().sort({ id: -1 });
    const newId = latestProduct ? latestProduct.id + 1 : 1;
    return newId;
  } catch (error) {
    throw new Error("Error generating ID");
  }
}
