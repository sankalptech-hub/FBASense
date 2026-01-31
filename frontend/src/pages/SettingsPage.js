import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    low_stock_threshold: 10,
    currency: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isDemoMode, user } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (isDemoMode) {
      toast.error('Cannot save settings in demo mode');
      return;
    }

    setSaving(true);

    try {
      await api.post('/api/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl" data-testid="settings-page">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your app preferences</p>
      </div>

      {/* Account Info */}
      <Card className="p-6 border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold font-heading">Account</h2>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user?.email || 'demo@example.com'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">Account Type</span>
            <span className="text-sm font-medium">{isDemoMode ? 'Demo' : 'Active'}</span>
          </div>
        </div>
      </Card>

      {/* Inventory Settings */}
      <Card className="p-6 border shadow-sm">
        <h2 className="text-lg font-bold font-heading mb-4">Inventory Settings</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="threshold" className="mb-2 block">
              Low Stock Threshold
            </Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              value={settings.low_stock_threshold}
              onChange={(e) => setSettings({ ...settings, low_stock_threshold: parseInt(e.target.value) })}
              data-testid="low-stock-threshold-input"
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Items at or below this quantity will be marked as low stock
            </p>
          </div>

          <div>
            <Label htmlFor="currency" className="mb-2 block">
              Currency
            </Label>
            <select
              id="currency"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="px-3 py-2 border rounded-md text-sm bg-background max-w-xs"
              data-testid="currency-select"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              Display currency for prices and costs
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || isDemoMode}
            data-testid="save-settings-button"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* App Info */}
      <Card className="p-6 border shadow-sm bg-muted/30">
        <h2 className="text-lg font-bold font-heading mb-4">About FBASense</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Version:</span> 1.0.0</p>
          <p><span className="font-medium text-foreground">Purpose:</span> Smart inventory management for Amazon sellers</p>
          <p className="mt-4 pt-4 border-t">
            FBASense helps you turn messy Excel/CSV files into clear inventory insights without requiring Amazon API integration.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
