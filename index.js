require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const connectDB = require('./config/db');
const setupSwaggerDocs = require('./swagger');

const app = express();
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
setupSwaggerDocs(app);

app.listen(PORT, () => {
  console.log('Server running on http://localhost:5000');
  console.log('Swagger docs available at http://localhost:5000/api-docs');
});
