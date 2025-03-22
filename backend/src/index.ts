import express, { Request, Response } from 'express';
import cors from "cors";
import router from './userRouter';
import accountrouter from './accountRouter';


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/user',router);
app.use('/api/v1/account',accountrouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

