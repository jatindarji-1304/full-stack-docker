import app from "./app.js";
import "dotenv/config";
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.error(`Server running on http://localhost:${PORT}`);
});
