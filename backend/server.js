import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase client (demo mode if env vars missing)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const isDemoMode = !supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL';

let supabase = null;
if (!isDemoMode) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// File upload configuration
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Mock data for demo mode
const mockData = {
  inventory: [
    { id: '1', sku: 'AMZ-001', asin: 'B08X6H9R2L', product_name: 'Premium Wireless Headphones', quantity: 150, cost: 45.00, price: 89.99, status: 'OK', user_id: 'demo' },
    { id: '2', sku: 'AMZ-002', asin: 'B09Y3F2K8M', product_name: 'Smart Watch Pro', quantity: 8, cost: 120.00, price: 249.99, status: 'Low', user_id: 'demo' },
    { id: '3', sku: 'AMZ-003', asin: 'B07H8L5X6D', product_name: 'USB-C Cable 6ft', quantity: 500, cost: 3.50, price: 12.99, status: 'OK', user_id: 'demo' },
    { id: '4', sku: 'AMZ-004', asin: 'B08K9M3N7P', product_name: 'Laptop Stand Adjustable', quantity: 5, cost: 18.00, price: 39.99, status: 'Low', user_id: 'demo' },
    { id: '5', sku: 'AMZ-005', asin: 'B09L4M8N2Q', product_name: 'Portable Charger 20000mAh', quantity: 0, cost: 22.00, price: 49.99, status: 'Out', user_id: 'demo' },
    { id: '6', sku: 'AMZ-006', asin: 'B07Q8R3S5T', product_name: 'Bluetooth Speaker', quantity: 75, cost: 28.00, price: 59.99, status: 'OK', user_id: 'demo' },
    { id: '7', sku: 'AMZ-007', asin: 'B08V7W9X2Y', product_name: 'Phone Case iPhone 15', quantity: 3, cost: 5.00, price: 19.99, status: 'Low', user_id: 'demo' },
    { id: '8', sku: 'AMZ-008', asin: 'B09Z1A2B4C', product_name: 'LED Desk Lamp', quantity: 200, cost: 15.00, price: 34.99, status: 'OK', user_id: 'demo' }
  ],
  sales: [
    { id: '1', sku: 'AMZ-001', product_name: 'Premium Wireless Headphones', date: '2025-01-15', quantity_sold: 12, revenue: 1079.88, user_id: 'demo' },
    { id: '2', sku: 'AMZ-003', product_name: 'USB-C Cable 6ft', date: '2025-01-14', quantity_sold: 45, revenue: 584.55, user_id: 'demo' },
    { id: '3', sku: 'AMZ-006', product_name: 'Bluetooth Speaker', date: '2025-01-13', quantity_sold: 8, revenue: 479.92, user_id: 'demo' },
    { id: '4', sku: 'AMZ-002', product_name: 'Smart Watch Pro', date: '2025-01-12', quantity_sold: 5, revenue: 1249.95, user_id: 'demo' },
    { id: '5', sku: 'AMZ-008', product_name: 'LED Desk Lamp', date: '2025-01-11', quantity_sold: 18, revenue: 629.82, user_id: 'demo' },
    { id: '6', sku: 'AMZ-004', product_name: 'Laptop Stand Adjustable', date: '2025-01-10', quantity_sold: 7, revenue: 279.93, user_id: 'demo' },
    { id: '7', sku: 'AMZ-007', product_name: 'Phone Case iPhone 15', date: '2025-01-09', quantity_sold: 22, revenue: 439.78, user_id: 'demo' },
    { id: '8', sku: 'AMZ-001', product_name: 'Premium Wireless Headphones', date: '2025-01-08', quantity_sold: 15, revenue: 1349.85, user_id: 'demo' }
  ],
  uploads: [
    { id: '1', filename: 'inventory_jan_2025.csv', upload_date: '2025-01-15T10:30:00Z', rows_processed: 8, status: 'Success', user_id: 'demo' },
    { id: '2', filename: 'sales_report_dec.xlsx', upload_date: '2025-01-10T14:20:00Z', rows_processed: 125, status: 'Success', user_id: 'demo' }
  ],
  settings: {
    low_stock_threshold: 10,
    currency: 'USD'
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    demo_mode: isDemoMode,
    message: isDemoMode ? 'Running in demo mode - Supabase not configured' : 'Connected to Supabase'
  });
});

// Get demo mode status
app.get('/api/demo-status', (req, res) => {
  res.json({ demo_mode: isDemoMode });
});

// Auth endpoints (demo mode compatible)
app.post('/api/auth/signup', async (req, res) => {
  if (isDemoMode) {
    return res.json({ 
      user: { id: 'demo', email: 'demo@example.com' },
      session: { access_token: 'demo-token' },
      demo: true
    });
  }
  
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (isDemoMode) {
    return res.json({ 
      user: { id: 'demo', email: 'demo@example.com' },
      session: { access_token: 'demo-token' },
      demo: true
    });
  }
  
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  if (isDemoMode) {
    return res.json({ success: true });
  }
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Inventory endpoints
app.get('/api/inventory', async (req, res) => {
  if (isDemoMode) {
    return res.json(mockData.inventory);
  }
  
  try {
    const userId = req.headers['user-id'];
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  if (isDemoMode) {
    return res.status(403).json({ error: 'Cannot save in demo mode' });
  }
  
  try {
    const userId = req.headers['user-id'];
    const items = req.body.items || [req.body];
    const itemsWithUser = items.map(item => ({ ...item, user_id: userId }));
    
    const { data, error } = await supabase
      .from('inventory')
      .insert(itemsWithUser)
      .select();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  if (isDemoMode) {
    return res.status(403).json({ error: 'Cannot update in demo mode' });
  }
  
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];
    const { data, error } = await supabase
      .from('inventory')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  if (isDemoMode) {
    return res.status(403).json({ error: 'Cannot delete in demo mode' });
  }
  
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales endpoints
app.get('/api/sales', async (req, res) => {
  if (isDemoMode) {
    return res.json(mockData.sales);
  }
  
  try {
    const userId = req.headers['user-id'];
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  if (isDemoMode) {
    return res.status(403).json({ error: 'Cannot save in demo mode' });
  }
  
  try {
    const userId = req.headers['user-id'];
    const items = req.body.items || [req.body];
    const itemsWithUser = items.map(item => ({ ...item, user_id: userId }));
    
    const { data, error } = await supabase
      .from('sales')
      .insert(itemsWithUser)
      .select();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload history endpoints
app.get('/api/uploads', async (req, res) => {
  if (isDemoMode) {
    return res.json(mockData.uploads);
  }
  
  try {
    const userId = req.headers['user-id'];
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', userId)
      .order('upload_date', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (isDemoMode) {
    return res.status(403).json({ error: 'File upload disabled in demo mode. Configure Supabase to enable this feature.' });
  }
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.headers['user-id'];
    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    
    let data = [];
    
    // Parse based on file type
    if (fileType === 'text/csv' || req.file.originalname.endsWith('.csv')) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const Papa = (await import('papaparse')).default;
      const result = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
      data = result.data;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || req.file.originalname.endsWith('.xlsx')) {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file type. Please upload CSV or XLSX files.' });
    }
    
    // Clean up temp file
    fs.unlinkSync(filePath);
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'File is empty or invalid format' });
    }
    
    // Record upload
    const uploadRecord = {
      user_id: userId,
      filename: req.file.originalname,
      upload_date: new Date().toISOString(),
      rows_processed: data.length,
      status: 'Success'
    };
    
    await supabase.from('uploads').insert([uploadRecord]);
    
    res.json({ 
      success: true, 
      rows: data.length,
      data: data,
      message: `Successfully parsed ${data.length} rows`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Settings endpoints
app.get('/api/settings', async (req, res) => {
  if (isDemoMode) {
    return res.json(mockData.settings);
  }
  
  try {
    const userId = req.headers['user-id'];
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || { low_stock_threshold: 10, currency: 'USD' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  if (isDemoMode) {
    return res.status(403).json({ error: 'Cannot save settings in demo mode' });
  }
  
  try {
    const userId = req.headers['user-id'];
    const { data, error } = await supabase
      .from('settings')
      .upsert({ ...req.body, user_id: userId })
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Demo mode: ${isDemoMode}`);
  if (isDemoMode) {
    console.log('⚠️  Supabase not configured - running with mock data');
    console.log('   Add SUPABASE_URL and SUPABASE_ANON_KEY to .env to enable database');
  }
});
