import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectToDatabase from '@jewellery-website/db';
import categoriesRouter from './routes/categories';
import subcategoriesRouter from './routes/subcategories';
import productsRouter from './routes/products';
import assetsRouter from './routes/assets';
import siteSettingsRouter from './routes/siteSettings';
import bannersRouter from './routes/banners';
import bulkUploadRouter from './routes/bulkUpload';
import metalRatesRouter from './routes/metalRates';
import authRouter from './routes/auth';
import wholesalersRouter from './routes/wholesalers';
import customersRouter from './routes/customers';
import ordersRouter from './routes/orders';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

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
app.use('/api/site-settings', siteSettingsRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/bulk-upload', bulkUploadRouter);
app.use('/api/metal-rates', metalRatesRouter);
app.use('/api/auth', authRouter);
app.use('/api/wholesalers', wholesalersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);

// Start server with database connection
async function startServer() {
  try {
    // Connect to database
    await connectToDatabase(MONGODB_URI);
    
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
