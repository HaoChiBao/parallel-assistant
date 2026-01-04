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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
