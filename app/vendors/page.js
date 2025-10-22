'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [vendorSpend, setVendorSpend] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    rating: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
    fetchVendorSpend();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      if (data.ok) setVendors(data.data.vendors);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorSpend = async () => {
    try {
      const res = await fetch('/api/analytics/vendor-spend');
      const data = await res.json();
      if (data.ok) setVendorSpend(data.data.vendorSpend);
    } catch (err) {
      console.error('Failed to fetch vendor spend:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = { ...formData };
      if (formData.rating) payload.rating = parseFloat(formData.rating);

      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create vendor');
      }

      setFormData({ name: '', contact: '', address: '', rating: '' });
      setShowForm(false);
      fetchVendors();
    } catch (err) {
      setError(err.message);
    }
  };

  const getVendorSpend = (vendorId) => {
    const spend = vendorSpend.find((v) => v._id === vendorId);
    return spend ? spend.totalSpend : 0;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Vendors</h2>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'New Vendor'}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Vendor Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <Input
                    label="Rating (0-5)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <Button type="submit">Create Vendor</Button>
              </form>
            </Card>
          )}

          <Card>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table
                headers={['Name', 'Contact', 'Address', 'Rating', 'Total Spend']}
                data={vendors}
                renderRow={(vendor) => (
                  <>
                    <td className="px-6 py-4">{vendor.name}</td>
                    <td className="px-6 py-4">{vendor.contact || 'N/A'}</td>
                    <td className="px-6 py-4">{vendor.address || 'N/A'}</td>
                    <td className="px-6 py-4">{vendor.rating || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium">
                      ${getVendorSpend(vendor._id).toLocaleString()}
                    </td>
                  </>
                )}
              />
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
