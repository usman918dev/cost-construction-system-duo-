'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: User Info, 2: Company Selection
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    companyOption: 'new', // 'new' or 'existing'
    companyId: '',
    companyName: '',
    companyDomain: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare the request body based on company option
      const body = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.companyOption === 'new') {
        // Creating a new company
        if (!formData.companyName) {
          throw new Error('Company name is required');
        }
        body.companyName = formData.companyName;
        if (formData.companyDomain) {
          body.companyDomain = formData.companyDomain;
        }
      } else {
        // Joining an existing company
        if (!formData.companyId) {
          throw new Error('Please select a company');
        }
        body.companyId = formData.companyId;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      // Redirect to login page after successful registration
      router.push('/login?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-6">
            {step === 1 ? 'Create Account' : 'Company Information'}
          </h1>

          {step === 1 ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Min 6 characters"
              />
              <Select
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: 'viewer', label: 'Viewer (Read Only)' },
                  { value: 'manager', label: 'Manager (Full Access)' },
                ]}
              />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button onClick={handleNext} className="w-full">
                Next
              </Button>
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Setup
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="companyOption"
                      value="new"
                      checked={formData.companyOption === 'new'}
                      onChange={(e) =>
                        setFormData({ ...formData, companyOption: e.target.value })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">Create a new company</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="companyOption"
                      value="existing"
                      checked={formData.companyOption === 'existing'}
                      onChange={(e) =>
                        setFormData({ ...formData, companyOption: e.target.value })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">Join an existing company</span>
                  </label>
                </div>
              </div>

              {formData.companyOption === 'new' ? (
                <>
                  <Input
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    placeholder="e.g., ABC Construction Co."
                  />
                  <Input
                    label="Company Domain (Optional)"
                    value={formData.companyDomain}
                    onChange={(e) =>
                      setFormData({ ...formData, companyDomain: e.target.value })
                    }
                    placeholder="e.g., abcconstruction.com"
                  />
                  <p className="text-xs text-gray-500">
                    You will be the first user of this company. You can invite others later.
                  </p>
                </>
              ) : (
                <>
                  <Input
                    label="Company ID"
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    required
                    placeholder="Enter company ID provided by your administrator"
                  />
                  <p className="text-xs text-gray-500">
                    Contact your company administrator to get the Company ID.
                  </p>
                </>
              )}

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
