'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [activeTab, setActiveTab] = useState('phases');
  const [showForm, setShowForm] = useState({ phases: false, categories: false, items: false, purchases: false });
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, phasesRes, vendorsRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/phases?projectId=${id}`),
        fetch('/api/vendors'),
      ]);

      const projectData = await projectRes.json();
      const phasesData = await phasesRes.json();
      const vendorsData = await vendorsRes.json();

      if (projectData.ok) setProject(projectData.data.project);
      if (phasesData.ok) {
        setPhases(phasesData.data.phases);
        if (phasesData.data.phases.length > 0) {
          fetchCategories(phasesData.data.phases[0]._id);
        }
      }
      if (vendorsData.ok) setVendors(vendorsData.data.vendors);

      fetchPurchases();
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const fetchCategories = async (phaseId) => {
    try {
      const res = await fetch(`/api/categories?phaseId=${phaseId}`);
      const data = await res.json();
      if (data.ok) {
        setCategories(data.data.categories);
        if (data.data.categories.length > 0) {
          fetchItems(data.data.categories[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchItems = async (categoryId) => {
    try {
      const res = await fetch(`/api/items?categoryId=${categoryId}`);
      const data = await res.json();
      if (data.ok) setItems(data.data.items);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`/api/purchases?projectId=${id}`);
      const data = await res.json();
      if (data.ok) setPurchases(data.data.purchases);
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    }
  };

  const handlePhaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/phases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, projectId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setFormData({});
      setShowForm({ ...showForm, phases: false });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setFormData({});
      setShowForm({ ...showForm, categories: false });
      if (formData.phaseId) fetchCategories(formData.phaseId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ratePerUnit: parseFloat(formData.ratePerUnit),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setFormData({});
      setShowForm({ ...showForm, items: false });
      if (formData.categoryId) fetchItems(formData.categoryId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId: id,
          quantity: parseFloat(formData.quantity),
          pricePerUnit: parseFloat(formData.pricePerUnit),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setFormData({});
      setShowForm({ ...showForm, purchases: false });
      fetchPurchases();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!project) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
          <p className="text-gray-600 mb-6">Client: {project.client}</p>

          <div className="flex gap-2 mb-6 border-b">
            {['phases', 'categories', 'items', 'purchases'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 capitalize ${
                  activeTab === tab ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'phases' && (
            <>
              <Button onClick={() => setShowForm({ ...showForm, phases: !showForm.phases })} className="mb-4">
                {showForm.phases ? 'Cancel' : 'Add Phase'}
              </Button>

              {showForm.phases && (
                <Card className="mb-4">
                  <form onSubmit={handlePhaseSubmit} className="space-y-4">
                    <Select
                      label="Phase Type"
                      options={[
                        { value: '', label: 'Select phase' },
                        { value: 'Grey', label: 'Grey' },
                        { value: 'Finishing', label: 'Finishing' },
                      ]}
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <Button type="submit">Create Phase</Button>
                  </form>
                </Card>
              )}

              <Card>
                <Table
                  headers={['Name', 'Description', 'Created']}
                  data={phases}
                  renderRow={(phase) => (
                    <>
                      <td className="px-6 py-4">{phase.name}</td>
                      <td className="px-6 py-4">{phase.description || 'N/A'}</td>
                      <td className="px-6 py-4">{new Date(phase.createdAt).toLocaleDateString()}</td>
                    </>
                  )}
                />
              </Card>
            </>
          )}

          {activeTab === 'categories' && (
            <>
              <Button onClick={() => setShowForm({ ...showForm, categories: !showForm.categories })} className="mb-4">
                {showForm.categories ? 'Cancel' : 'Add Category'}
              </Button>

              {showForm.categories && (
                <Card className="mb-4">
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <Select
                      label="Phase"
                      options={[
                        { value: '', label: 'Select phase' },
                        ...phases.map((p) => ({ value: p._id, label: p.name })),
                      ]}
                      value={formData.phaseId || ''}
                      onChange={(e) => setFormData({ ...formData, phaseId: e.target.value })}
                      required
                    />
                    <Input
                      label="Category Name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <Button type="submit">Create Category</Button>
                  </form>
                </Card>
              )}

              <Card>
                <Table
                  headers={['Name', 'Phase', 'Description']}
                  data={categories}
                  renderRow={(cat) => (
                    <>
                      <td className="px-6 py-4">{cat.name}</td>
                      <td className="px-6 py-4">{cat.phaseId?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{cat.description || 'N/A'}</td>
                    </>
                  )}
                />
              </Card>
            </>
          )}

          {activeTab === 'items' && (
            <>
              <Button onClick={() => setShowForm({ ...showForm, items: !showForm.items })} className="mb-4">
                {showForm.items ? 'Cancel' : 'Add Item'}
              </Button>

              {showForm.items && (
                <Card className="mb-4">
                  <form onSubmit={handleItemSubmit} className="space-y-4">
                    <Select
                      label="Category"
                      options={[
                        { value: '', label: 'Select category' },
                        ...categories.map((c) => ({ value: c._id, label: c.name })),
                      ]}
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    />
                    <Input
                      label="Item Name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Unit"
                      placeholder="e.g., bags, tons, sqft"
                      value={formData.unit || ''}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                    <Input
                      label="Rate Per Unit"
                      type="number"
                      step="0.01"
                      value={formData.ratePerUnit || ''}
                      onChange={(e) => setFormData({ ...formData, ratePerUnit: e.target.value })}
                      required
                    />
                    <Select
                      label="Default Vendor (Optional)"
                      options={[
                        { value: '', label: 'Select vendor' },
                        ...vendors.map((v) => ({ value: v._id, label: v.name })),
                      ]}
                      value={formData.defaultVendor || ''}
                      onChange={(e) => setFormData({ ...formData, defaultVendor: e.target.value })}
                    />
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <Button type="submit">Create Item</Button>
                  </form>
                </Card>
              )}

              <Card>
                <Table
                  headers={['Name', 'Category', 'Unit', 'Rate', 'Vendor']}
                  data={items}
                  renderRow={(item) => (
                    <>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="px-6 py-4">{item.categoryId?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{item.unit}</td>
                      <td className="px-6 py-4">${item.ratePerUnit}</td>
                      <td className="px-6 py-4">{item.defaultVendor?.name || 'N/A'}</td>
                    </>
                  )}
                />
              </Card>
            </>
          )}

          {activeTab === 'purchases' && (
            <>
              <Button onClick={() => setShowForm({ ...showForm, purchases: !showForm.purchases })} className="mb-4">
                {showForm.purchases ? 'Cancel' : 'Add Purchase'}
              </Button>

              {showForm.purchases && (
                <Card className="mb-4">
                  <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Phase"
                        options={[
                          { value: '', label: 'Select phase' },
                          ...phases.map((p) => ({ value: p._id, label: p.name })),
                        ]}
                        value={formData.phaseId || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, phaseId: e.target.value });
                          fetchCategories(e.target.value);
                        }}
                        required
                      />
                      <Select
                        label="Category"
                        options={[
                          { value: '', label: 'Select category' },
                          ...categories.map((c) => ({ value: c._id, label: c.name })),
                        ]}
                        value={formData.categoryId || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, categoryId: e.target.value });
                          fetchItems(e.target.value);
                        }}
                        required
                      />
                      <Select
                        label="Item"
                        options={[
                          { value: '', label: 'Select item' },
                          ...items.map((i) => ({ value: i._id, label: i.name })),
                        ]}
                        value={formData.itemId || ''}
                        onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                        required
                      />
                      <Select
                        label="Vendor (Optional)"
                        options={[
                          { value: '', label: 'Select vendor' },
                          ...vendors.map((v) => ({ value: v._id, label: v.name })),
                        ]}
                        value={formData.vendorId || ''}
                        onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      />
                      <Input
                        label="Quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity || ''}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                      />
                      <Input
                        label="Price Per Unit"
                        type="number"
                        step="0.01"
                        value={formData.pricePerUnit || ''}
                        onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                        required
                      />
                      <Input
                        label="Purchase Date"
                        type="date"
                        value={formData.purchaseDate || ''}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      />
                      <Input
                        label="Invoice URL"
                        value={formData.invoiceUrl || ''}
                        onChange={(e) => setFormData({ ...formData, invoiceUrl: e.target.value })}
                      />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <Button type="submit">Create Purchase</Button>
                  </form>
                </Card>
              )}

              <Card>
                <Table
                  headers={['Item', 'Quantity', 'Price', 'Total', 'Vendor', 'Date']}
                  data={purchases}
                  renderRow={(purchase) => (
                    <>
                      <td className="px-6 py-4">{purchase.itemId?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{purchase.quantity}</td>
                      <td className="px-6 py-4">${purchase.pricePerUnit}</td>
                      <td className="px-6 py-4">${purchase.totalCost.toLocaleString()}</td>
                      <td className="px-6 py-4">{purchase.vendorId?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </td>
                    </>
                  )}
                />
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
