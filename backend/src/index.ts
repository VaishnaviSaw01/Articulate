import { app } from "./app";
import { env } from "./env";

app.listen(env.port, () => {
  console.log(`Articulate backend listening on http://localhost:${env.port}`);
});
