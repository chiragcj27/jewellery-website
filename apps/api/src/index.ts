import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectToDatabase from '@jewellery-website/db';
import categoriesRouter from './routes/categories';
import subcategoriesRouter from './routes/subcategories';
import productsRouter from './routes/products';
import assetsRouter from './routes/assets';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API is running!' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/subcategories', subcategoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/assets', assetsRouter);

// Start server with database connection
async function startServer() {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
