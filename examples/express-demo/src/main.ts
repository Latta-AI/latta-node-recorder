import express from "express";
import { latta } from "@latta/express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/exception", (req, res) => {
  throw new Error("Oooh, something went wrong");
});

app.use(latta(process.env.LATTA_API_KEY as string, { verbose: true }));

setTimeout(() => {
  throw new Error("error");
}, 2000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on: *:${PORT}`);
});
