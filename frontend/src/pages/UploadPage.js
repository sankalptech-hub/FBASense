import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../utils/api';
import { parseCSV, parseExcel, validateInventoryData, validateSalesData } from '../utils/fileUtils';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const UploadPage = () => {
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const { isDemoMode } = useAuth();

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await api.get('/api/uploads');
      setUploads(response.data);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
      toast.error('Failed to load upload history');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (isDemoMode) {
      toast.error('File upload is disabled in demo mode. Configure Supabase to enable this feature.');
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      let parsedData = [];
      
      // Parse file
      if (file.name.endsWith('.csv')) {
        parsedData = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedData = await parseExcel(file);
      } else {
        toast.error('Unsupported file type. Please upload CSV or XLSX files.');
        setUploading(false);
        return;
      }

      // Validate data
      const errors = uploadType === 'inventory' 
        ? validateInventoryData(parsedData)
        : validateSalesData(parsedData);

      if (errors.length > 0) {
        toast.error(`Validation errors found: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
        setUploading(false);
        return;
      }

      // Process and save
      if (uploadType === 'inventory') {
        // Map to inventory format
        const inventoryItems = parsedData.map(row => ({
          sku: row.sku || row.SKU,
          asin: row.asin || row.ASIN || '',
          product_name: row.product_name || row['Product Name'] || row.name,
          quantity: Number(row.quantity || row.Quantity || 0),
          cost: Number(row.cost || row.Cost || 0),
          price: Number(row.price || row.Price || 0),
          status: Number(row.quantity || 0) === 0 ? 'Out' : Number(row.quantity || 0) <= 10 ? 'Low' : 'OK',
        }));

        await api.post('/api/inventory', { items: inventoryItems });
      } else {
        // Map to sales format
        const salesItems = parsedData.map(row => ({
          sku: row.sku || row.SKU,
          product_name: row.product_name || row['Product Name'] || row.name,
          date: row.date || row.Date || new Date().toISOString().split('T')[0],
          quantity_sold: Number(row.quantity_sold || row['Quantity Sold'] || row.quantity || 0),
          revenue: Number(row.revenue || row.Revenue || 0),
        }));

        await api.post('/api/sales', { items: salesItems });
      }

      toast.success(`Successfully uploaded ${parsedData.length} rows!`);
      fetchUploads();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [uploadType, isDemoMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: uploading || isDemoMode
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Failed':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="upload-page">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">File Upload</h1>
        <p className="text-muted-foreground mt-1">Upload your inventory or sales data</p>
      </div>

      {isDemoMode && (
        <Card className="p-4 border border-accent/20 bg-accent/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-accent">Demo Mode Active</p>
              <p className="text-sm text-muted-foreground mt-1">
                File upload is disabled. Configure Supabase (see README) to enable uploading and saving data.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upload Type Selector */}
      <Card className="p-4 border shadow-sm">
        <label className="block text-sm font-medium mb-2">Upload Type</label>
        <div className="flex gap-3">
          <Button
            variant={uploadType === 'inventory' ? 'default' : 'outline'}
            onClick={() => setUploadType('inventory')}
            data-testid="upload-type-inventory"
          >
            Inventory Data
          </Button>
          <Button
            variant={uploadType === 'sales' ? 'default' : 'outline'}
            onClick={() => setUploadType('sales')}
            data-testid="upload-type-sales"
          >
            Sales Data
          </Button>
        </div>
      </Card>

      {/* Dropzone */}
      <Card className="border-2 border-dashed shadow-sm overflow-hidden">
        <div
          {...getRootProps()}
          className={`p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/30'
          } ${isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-testid="file-dropzone"
        >
          <input {...getInputProps()} />
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-lg font-medium">Uploading and processing...</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold font-heading mb-2">
                {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to select file
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, XLSX
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Expected Format Guide */}
      <Card className="p-6 border shadow-sm bg-muted/30">
        <h3 className="text-lg font-bold font-heading mb-3">Expected File Format</h3>
        <div className="space-y-3">
          {uploadType === 'inventory' ? (
            <div>
              <p className="text-sm font-medium mb-2">Inventory CSV/XLSX should contain:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><span className="font-mono-data">SKU</span> (required)</li>
                <li><span className="font-mono-data">Product Name</span> (required)</li>
                <li><span className="font-mono-data">Quantity</span> (required, number)</li>
                <li><span className="font-mono-data">Cost</span> (required, number)</li>
                <li><span className="font-mono-data">Price</span> (required, number)</li>
                <li><span className="font-mono-data">ASIN</span> (optional)</li>
              </ul>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium mb-2">Sales CSV/XLSX should contain:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><span className="font-mono-data">SKU</span> (required)</li>
                <li><span className="font-mono-data">Product Name</span> (required)</li>
                <li><span className="font-mono-data">Date</span> (required, YYYY-MM-DD)</li>
                <li><span className="font-mono-data">Quantity Sold</span> (required, number)</li>
                <li><span className="font-mono-data">Revenue</span> (required, number)</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Upload History */}
      <div>
        <h2 className="text-xl font-bold font-heading mb-4">Upload History</h2>
        <Card className="border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No upload history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="upload-history-table">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-sm">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-sm">Filename</th>
                    <th className="px-4 py-3 text-left font-medium text-sm">Upload Date</th>
                    <th className="px-4 py-3 text-right font-medium text-sm">Rows Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((upload, index) => (
                    <tr key={upload.id} className="border-b hover:bg-muted/30 transition-colors" data-testid={`upload-row-${index}`}>
                      <td className="px-4 py-3">{getStatusIcon(upload.status)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium">{upload.filename}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(upload.upload_date).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono-data text-sm font-medium">{upload.rows_processed}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UploadPage;
