const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/reviews", (req, res) => {
  res.json([
    {
      id: 1,
      user: "Praneeth",
      review: "Amazing trip planner!"
    }
  ]);
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});