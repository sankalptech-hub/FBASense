import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'sku', direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const { isDemoMode } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterAndSortInventory();
  }, [inventory, searchTerm, sortConfig]);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/api/inventory');
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortInventory = () => {
    let filtered = [...inventory];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.asin && item.asin.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    setFilteredInventory(filtered);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDelete = async (id) => {
    if (isDemoMode) {
      toast.error('Cannot delete in demo mode');
      return;
    }

    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/inventory/${id}`);
        toast.success('Item deleted successfully');
        fetchInventory();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK':
        return 'text-green-600 bg-green-50';
      case 'Low':
        return 'text-accent bg-accent/10';
      case 'Out':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="inventory-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">{filteredInventory.length} items in stock</p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU, product name, or ASIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="inventory-search"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="inventory-table">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('sku')}
                    className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors"
                    data-testid="sort-sku"
                  >
                    SKU
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('product_name')}
                    className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors"
                  >
                    Product Name
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-medium text-sm">ASIN</span>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('quantity')}
                    className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors ml-auto"
                    data-testid="sort-quantity"
                  >
                    Quantity
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('cost')}
                    className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors ml-auto"
                  >
                    Cost
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors ml-auto"
                  >
                    Price
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors"
                  >
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="font-medium text-sm">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-muted/30 transition-colors"
                  data-testid={`inventory-row-${index}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-sm font-medium">{item.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{item.product_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-sm text-muted-foreground">{item.asin || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono-data text-sm font-medium">{item.quantity}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono-data text-sm">${Number(item.cost).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono-data text-sm">${Number(item.price).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={isDemoMode}
                        data-testid={`edit-item-${index}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDemoMode}
                        data-testid={`delete-item-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No inventory items found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InventoryPage;
