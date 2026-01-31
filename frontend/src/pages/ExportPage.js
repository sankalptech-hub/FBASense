import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import api from '../utils/api';
import { exportToExcel, exportToCSV } from '../utils/fileUtils';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const ExportPage = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { isDemoMode } = useAuth();

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
      toast.error('Failed to load export data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type, format) => {
    if (isDemoMode) {
      toast.error('Export is disabled in demo mode. Configure Supabase to enable this feature.');
      return;
    }

    setExporting(true);

    try {
      let data = [];
      let filename = '';

      switch (type) {
        case 'inventory':
          data = inventory.map(item => ({
            SKU: item.sku,
            ASIN: item.asin || '',
            'Product Name': item.product_name,
            Quantity: item.quantity,
            Cost: item.cost,
            Price: item.price,
            Status: item.status,
          }));
          filename = `inventory_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'sales':
          data = sales.map(sale => ({
            Date: sale.date,
            SKU: sale.sku,
            'Product Name': sale.product_name,
            'Quantity Sold': sale.quantity_sold,
            Revenue: sale.revenue,
          }));
          filename = `sales_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'summary':
          const totalCost = inventory.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
          const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0);
          
          data = [
            { Metric: 'Total SKUs', Value: inventory.length },
            { Metric: 'Total Stock Units', Value: inventory.reduce((sum, item) => sum + item.quantity, 0) },
            { Metric: 'Low Stock Items', Value: inventory.filter(i => i.status === 'Low').length },
            { Metric: 'Out of Stock Items', Value: inventory.filter(i => i.status === 'Out').length },
            { Metric: 'Total Inventory Cost', Value: `$${totalCost.toFixed(2)}` },
            { Metric: 'Total Inventory Value', Value: `$${totalValue.toFixed(2)}` },
            { Metric: 'Potential Profit', Value: `$${(totalValue - totalCost).toFixed(2)}` },
            { Metric: 'Total Sales Records', Value: sales.length },
            { Metric: 'Total Revenue', Value: `$${totalRevenue.toFixed(2)}` },
          ];
          filename = `summary_report_${new Date().toISOString().split('T')[0]}`;
          break;

        default:
          toast.error('Invalid export type');
          setExporting(false);
          return;
      }

      if (data.length === 0) {
        toast.error('No data to export');
        setExporting(false);
        return;
      }

      if (format === 'xlsx') {
        exportToExcel(data, `${filename}.xlsx`);
      } else {
        exportToCSV(data, `${filename}.csv`);
      }

      toast.success(`Successfully exported ${data.length} rows!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading export options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="export-page">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Export Center</h1>
        <p className="text-muted-foreground mt-1">Download your data in Excel or CSV format</p>
      </div>

      {/* Export Options */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Inventory Export */}
        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold font-heading">Inventory Data</h3>
              <p className="text-sm text-muted-foreground">{inventory.length} items</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Export all inventory items with SKU, quantity, cost, and price information.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('inventory', 'xlsx')}
              disabled={exporting || isDemoMode}
              className="flex-1"
              data-testid="export-inventory-xlsx"
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button
              onClick={() => handleExport('inventory', 'csv')}
              disabled={exporting || isDemoMode}
              variant="outline"
              className="flex-1"
              data-testid="export-inventory-csv"
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        </Card>

        {/* Sales Export */}
        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold font-heading">Sales Data</h3>
              <p className="text-sm text-muted-foreground">{sales.length} records</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Export all sales records with dates, quantities sold, and revenue.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('sales', 'xlsx')}
              disabled={exporting || isDemoMode}
              className="flex-1"
              data-testid="export-sales-xlsx"
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button
              onClick={() => handleExport('sales', 'csv')}
              disabled={exporting || isDemoMode}
              variant="outline"
              className="flex-1"
              data-testid="export-sales-csv"
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        </Card>

        {/* Summary Report Export */}
        <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-md bg-accent/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold font-heading">Summary Report</h3>
              <p className="text-sm text-muted-foreground">Key metrics</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Export a summary report with key business metrics and KPIs.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('summary', 'xlsx')}
              disabled={exporting || isDemoMode}
              className="flex-1"
              data-testid="export-summary-xlsx"
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button
              onClick={() => handleExport('summary', 'csv')}
              disabled={exporting || isDemoMode}
              variant="outline"
              className="flex-1"
              data-testid="export-summary-csv"
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        </Card>
      </div>

      {/* Export Info */}
      <Card className="p-6 border shadow-sm bg-muted/30">
        <h3 className="text-lg font-bold font-heading mb-3">Export Information</h3>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>Exported files contain clean, formatted data ready for analysis</li>
          <li>Excel format (.xlsx) preserves data types and formatting</li>
          <li>CSV format (.csv) is compatible with most spreadsheet applications</li>
          <li>Files are timestamped with the current date for easy organization</li>
          <li>All exports use your current data - no historical snapshots</li>
        </ul>
      </Card>
    </div>
  );
};

export default ExportPage;
