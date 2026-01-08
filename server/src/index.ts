import express, { Request, Response } from 'express';
import cors from 'cors';
import listEndpoints from 'express-list-endpoints';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  const endpoints = listEndpoints(app);
  res.json({
    message: 'Heartbeat',
    endpoints,
    status: 'running'
  });
});

 // Start server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Registered routes:");
  listEndpoints(app).forEach((endpoint: any) => {
    console.log(`  ${endpoint.methods.join(", ")} ${endpoint.path}`);
  });
});

// Initialize WebSocket Server
import { WSServer } from "./ws";
new WSServer(server);

