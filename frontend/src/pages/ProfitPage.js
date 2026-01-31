import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { toast } from 'sonner';

const ProfitPage = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invResponse, salesResponse] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/sales')
      ]);
      
      setInventory(invResponse.data);
      setSales(salesResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load profit data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalInventoryCost = inventory.reduce((sum, item) => 
    sum + ((Number(item.cost) || 0) * (Number(item.quantity) || 0)), 0
  );
  
  const totalInventoryValue = inventory.reduce((sum, item) => 
    sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0
  );
  
  const potentialProfit = totalInventoryValue - totalInventoryCost;
  const profitMargin = totalInventoryValue > 0 ? (potentialProfit / totalInventoryValue) * 100 : 0;

  // Product-level profit analysis
  const productProfits = inventory.map(item => {
    const cost = Number(item.cost) || 0;
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const totalCost = cost * quantity;
    const totalValue = price * quantity;
    const profit = totalValue - totalCost;
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
    
    return {
      ...item,
      totalCost,
      totalValue,
      profit,
      margin,
      unitProfit: price - cost,
    };
  }).sort((a, b) => b.profit - a.profit);

  const topProfitable = productProfits.slice(0, 10).map(p => ({
    name: p.product_name.length > 20 ? p.product_name.substring(0, 20) + '...' : p.product_name,
    profit: p.profit,
    margin: p.margin,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profit analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="profit-page">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Profit Analysis</h1>
        <p className="text-muted-foreground mt-1">Cost vs revenue breakdown</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Inventory Cost</p>
              <p className="text-3xl font-bold font-heading mt-2 font-mono-data" data-testid="total-cost">
                ${totalInventoryCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
              <p className="text-3xl font-bold font-heading mt-2 font-mono-data" data-testid="total-value">
                ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-primary/20 bg-primary/5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Potential Profit</p>
              <p className="text-3xl font-bold font-heading mt-2 font-mono-data text-primary" data-testid="potential-profit">
                ${potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <Percent className="inline h-3 w-3 mr-1" />
                {profitMargin.toFixed(1)}% margin
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Profitable Products Chart */}
      <Card className="p-6 border shadow-sm">
        <h3 className="text-lg font-bold font-heading mb-4">Top 10 Products by Profit Potential</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topProfitable} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'profit') return [`$${value.toFixed(2)}`, 'Profit'];
                if (name === 'margin') return [`${value.toFixed(1)}%`, 'Margin'];
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="profit" fill="#1E1B4B" name="Profit ($)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Product Profit Table */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-bold font-heading">Product Profit Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="profit-table">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-sm">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-sm">Product Name</th>
                <th className="px-4 py-3 text-right font-medium text-sm">Quantity</th>
                <th className="px-4 py-3 text-right font-medium text-sm">Unit Cost</th>
                <th className="px-4 py-3 text-right font-medium text-sm">Unit Price</th>
                <th className="px-4 py-3 text-right font-medium text-sm">Unit Profit</th>
                <th className="px-4 py-3 text-right font-medium text-sm">Total Profit</th>
                <th className="px-4 py-3 text-right font-medium text-sm">Margin</th>
              </tr>
            </thead>
            <tbody>
              {productProfits.map((product, index) => (
                <tr key={product.id} className="border-b hover:bg-muted/30 transition-colors" data-testid={`profit-row-${index}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-sm font-medium">{product.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{product.product_name}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono-data text-sm">{product.quantity}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono-data text-sm">${Number(product.cost).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono-data text-sm">${Number(product.price).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono-data text-sm font-medium ${product.unitProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      ${product.unitProfit.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono-data text-sm font-bold ${product.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      ${product.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono-data text-sm ${product.margin >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {product.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {productProfits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No inventory data available</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfitPage;
