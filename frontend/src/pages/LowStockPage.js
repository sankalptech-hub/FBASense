import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const LowStockPage = () => {
  const [inventory, setInventory] = useState([]);
  const [settings, setSettings] = useState({ low_stock_threshold: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invResponse, settingsResponse] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/settings')
      ]);
      
      setInventory(invResponse.data);
      setSettings(settingsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load low stock data');
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = inventory.filter(item => {
    const qty = Number(item.quantity) || 0;
    return qty > 0 && qty <= settings.low_stock_threshold;
  });

  const outOfStockItems = inventory.filter(item => {
    const qty = Number(item.quantity) || 0;
    return qty === 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading stock alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="low-stock-page">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Low Stock Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Items at or below {settings.low_stock_threshold} units threshold
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 border border-accent/20 bg-accent/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-accent/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <p className="text-3xl font-bold font-heading text-accent" data-testid="low-stock-count">{lowStockItems.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-3xl font-bold font-heading text-destructive" data-testid="out-of-stock-count">{outOfStockItems.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-heading mb-4">Low Stock Items</h2>
          <Card className="border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="low-stock-table">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-sm">SKU</th>
                    <th className="px-4 py-3 text-left font-medium text-sm">Product Name</th>
                    <th className="px-4 py-3 text-right font-medium text-sm">Quantity</th>
                    <th className="px-4 py-3 text-right font-medium text-sm">Cost</th>
                    <th className="px-4 py-3 text-right font-medium text-sm">Price</th>
                    <th className="px-4 py-3 text-center font-medium text-sm">Alert Level</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, index) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors" data-testid={`low-stock-row-${index}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono-data text-sm font-medium">{item.sku}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{item.product_name}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono-data text-sm font-bold text-accent">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono-data text-sm">${Number(item.cost).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono-data text-sm">${Number(item.price).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent">
                          <AlertTriangle className="h-3 w-3" />
                          Low
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-heading mb-4">Out of Stock Items</h2>
          <Card className="border border-destructive/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="out-of-stock-table">
                <thead className="bg-destructive/5 border-b border-destructive/20">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-sm">SKU</th>
                    <th className="px-4 py-3 text-left font-medium text-sm">Product Name</th>
                    <th className="px-4 py-3 text-right font-medium text-sm">Cost</th>
                    <th className="px-4 py-3 text-right font-medium text-sm">Price</th>
                    <th className="px-4 py-3 text-center font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStockItems.map((item, index) => (
                    <tr key={item.id} className="border-b hover:bg-destructive/5 transition-colors" data-testid={`out-of-stock-row-${index}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono-data text-sm font-medium">{item.sku}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{item.product_name}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono-data text-sm">${Number(item.cost).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono-data text-sm">${Number(item.price).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Out
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
        <Card className="p-12 text-center border shadow-sm">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <TrendingDown className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold font-heading mb-2">All Stock Levels Healthy</h3>
          <p className="text-muted-foreground">
            No items are currently below the {settings.low_stock_threshold} units threshold.
          </p>
        </Card>
      )}
    </div>
  );
};

export default LowStockPage;
