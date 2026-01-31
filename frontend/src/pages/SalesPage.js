import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { toast } from 'sonner';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    filterByDateRange();
  }, [sales, dateRange]);

  const fetchSales = async () => {
    try {
      const response = await api.get('/api/sales');
      setSales(response.data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = () => {
    if (dateRange === 'all') {
      setFilteredSales(sales);
      return;
    }

    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= cutoffDate;
    });

    setFilteredSales(filtered);
  };

  const totalUnits = filteredSales.reduce((sum, sale) => sum + (Number(sale.quantity_sold) || 0), 0);
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (Number(sale.revenue) || 0), 0);
  const averageOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  const chartData = [...filteredSales]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14)
    .map(sale => ({
      date: new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Number(sale.revenue) || 0,
      units: Number(sale.quantity_sold) || 0,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="sales-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Sales Summary</h1>
          <p className="text-muted-foreground mt-1">{filteredSales.length} sales records</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
            data-testid="date-range-filter"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Units Sold</p>
              <p className="text-3xl font-bold font-heading mt-2 font-mono-data" data-testid="total-units-sold">
                {totalUnits.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold font-heading mt-2 font-mono-data" data-testid="total-revenue">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
              <p className="text-3xl font-bold font-heading mt-2 font-mono-data" data-testid="avg-order-value">
                ${averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6 border shadow-sm">
        <h3 className="text-lg font-bold font-heading mb-4">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#1E1B4B" strokeWidth={2} name="Revenue ($)" />
            <Line yAxisId="right" type="monotone" dataKey="units" stroke="#F97316" strokeWidth={2} name="Units Sold" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Sales Table */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-bold font-heading">Recent Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="sales-table">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-sm">Date</th>
                <th className="px-4 py-3 text-left font-medium text-sm">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-sm">Product Name</th>
                <th className="px-4 py-3 text-right font-medium text-sm">Units Sold</th>
                <th className="px-4 py-3 text-right font-medium text-sm">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
                <tr key={sale.id} className="border-b hover:bg-muted/30 transition-colors" data-testid={`sales-row-${index}`}>
                  <td className="px-4 py-3">
                    <span className="text-sm">{new Date(sale.date).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-sm font-medium">{sale.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{sale.product_name}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono-data text-sm font-medium">{sale.quantity_sold}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono-data text-sm font-bold">
                      ${Number(sale.revenue).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No sales data available for this period</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesPage;
