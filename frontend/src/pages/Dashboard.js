import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Package, TrendingDown, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [settings, setSettings] = useState({ low_stock_threshold: 10, currency: 'USD' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invResponse, salesResponse, settingsResponse] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/sales'),
        api.get('/api/settings')
      ]);
      
      setInventory(invResponse.data);
      setSales(salesResponse.data);
      setSettings(settingsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const totalSKUs = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const lowStockCount = inventory.filter(item => 
    item.status === 'Low' || (item.quantity > 0 && item.quantity <= settings.low_stock_threshold)
  ).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0 || item.status === 'Out').length;
  
  const last30Days = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return saleDate >= thirtyDaysAgo;
  });
  
  const monthlySales = last30Days.reduce((sum, sale) => sum + (Number(sale.quantity_sold) || 0), 0);
  const monthlyRevenue = last30Days.reduce((sum, sale) => sum + (Number(sale.revenue) || 0), 0);
  
  const totalCost = inventory.reduce((sum, item) => 
    sum + ((Number(item.cost) || 0) * (Number(item.quantity) || 0)), 0
  );
  const totalValue = inventory.reduce((sum, item) => 
    sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0
  );
  const potentialProfit = totalValue - totalCost;

  // Chart data
  const statusData = [
    { name: 'In Stock', value: inventory.filter(i => i.status === 'OK').length, color: '#10B981' },
    { name: 'Low Stock', value: lowStockCount, color: '#F97316' },
    { name: 'Out of Stock', value: outOfStockCount, color: '#EF4444' },
  ];

  const salesChartData = last30Days.slice(0, 7).reverse().map(sale => ({
    date: new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Number(sale.revenue) || 0,
    units: Number(sale.quantity_sold) || 0,
  }));

  const topProducts = [...inventory]
    .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
    .slice(0, 5)
    .map(item => ({
      name: item.product_name.length > 20 ? item.product_name.substring(0, 20) + '...' : item.product_name,
      value: Number(item.quantity) * Number(item.price),
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your inventory and sales performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total SKUs</p>
              <p className="text-3xl font-bold font-heading mt-2" data-testid="total-skus">{totalSKUs}</p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Stock</p>
              <p className="text-3xl font-bold font-heading mt-2 font-mono-data" data-testid="total-stock">{totalStock.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <p className="text-3xl font-bold font-heading mt-2" data-testid="low-stock-count">{lowStockCount}</p>
            </div>
            <div className="h-12 w-12 rounded-md bg-accent/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <p className="text-3xl font-bold font-heading mt-2 font-mono-data" data-testid="monthly-revenue">
                ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <Card className="p-6 border shadow-sm">
          <h3 className="text-lg font-bold font-heading mb-4">Sales Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#1E1B4B" strokeWidth={2} name="Revenue ($)" />
              <Line type="monotone" dataKey="units" stroke="#F97316" strokeWidth={2} name="Units Sold" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Inventory Status */}
        <Card className="p-6 border shadow-sm">
          <h3 className="text-lg font-bold font-heading mb-4">Inventory Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products by Value */}
        <Card className="p-6 border shadow-sm">
          <h3 className="text-lg font-bold font-heading mb-4">Top Products by Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#1E1B4B" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Profit Overview */}
        <Card className="p-6 border shadow-sm">
          <h3 className="text-lg font-bold font-heading mb-4">Profit Overview</h3>
          <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground">Total Inventory Cost</span>
              <span className="text-lg font-bold font-mono-data">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground">Total Inventory Value</span>
              <span className="text-lg font-bold font-mono-data">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-medium">Potential Profit</span>
              <span className="text-2xl font-bold font-mono-data text-primary" data-testid="potential-profit">
                ${potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Profit Margin</span>
              <span className="font-medium">
                {totalValue > 0 ? ((potentialProfit / totalValue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card className="p-6 border border-accent/20 bg-accent/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-bold font-heading text-accent mb-1">Stock Alerts</h3>
              <div className="space-y-1 text-sm">
                {lowStockCount > 0 && (
                  <p data-testid="low-stock-alert">
                    <span className="font-medium">{lowStockCount}</span> item{lowStockCount > 1 ? 's' : ''} running low on stock
                  </p>
                )}
                {outOfStockCount > 0 && (
                  <p data-testid="out-of-stock-alert">
                    <span className="font-medium">{outOfStockCount}</span> item{outOfStockCount > 1 ? 's' : ''} out of stock
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
