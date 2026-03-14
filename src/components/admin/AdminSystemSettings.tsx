import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { defaultSystemSettings } from '@/data/adminSeed';
import { useToast } from '@/hooks/use-toast';

export default function AdminSystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({ ...defaultSystemSettings });

  const handleSave = () => {
    // Persist would go through repository layer when backend is wired
    toast({
      title: 'Settings saved',
      description: 'Your system settings have been updated successfully.',
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">System Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Agency-wide defaults and branding configuration.
        </p>
      </div>

      {/* Agency Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" /> Agency Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agency-name">Agency Name</Label>
            <Input id="agency-name" value={settings.agencyName}
              onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-sm text-muted-foreground">
              Drag & drop or click to upload
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Defaults */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Regional Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={settings.defaultTimezone} onValueChange={(v) => setSettings({ ...settings, defaultTimezone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={settings.defaultCurrency} onValueChange={(v) => setSettings({ ...settings, defaultCurrency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reporting Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Reporting Cadence</Label>
            <Select value={settings.reportingDefaults.cadence}
              onValueChange={(v) => setSettings({ ...settings, reportingDefaults: { ...settings.reportingDefaults, cadence: v as any } })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="naming">Internal Naming Conventions</Label>
            <Input id="naming" placeholder="e.g. [Client]-[Channel]-[Year]"
              value={settings.internalNamingConventions}
              onChange={(e) => setSettings({ ...settings, internalNamingConventions: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
