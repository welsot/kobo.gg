import { type LoaderFunctionArgs, useLoaderData } from 'react-router';
import { serverFetch } from '~/utils/serverFetch';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '~/context/UserContext';
import { apiDeleteTxt, apiPostTxt } from '~/api/apiComponents';
import type { GetInitResponse } from '~/api/apiSchemas';
import { AuthRequired } from '~/components/AuthRequired';
import { AccessDenied } from '~/admin/components/AccessDenied';

export async function loader({ request }: LoaderFunctionArgs) {
  const { data, error } = await serverFetch<GetInitResponse>('/api/v1/init', request);

  if (error || !data) {
    return { txt: {}, error: error };
  }

  return data;
}

export default function AdminTxt() {
  const data = useLoaderData<GetInitResponse>();
  const { user } = useCurrentUser();
  const [txtMap, setTxtMap] = useState<Record<string, string>>(data.txt || {});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check for the key in session storage (if redirected from Txt component)
  useEffect(() => {
    const savedKey = sessionStorage.getItem('editingTxtKey');
    if (savedKey) {
      // Even if the key doesn't exist yet in txtMap, we'll create it for editing
      handleEdit(savedKey);
      // Clear it after use
      sessionStorage.removeItem('editingTxtKey');
    }
  }, []);

  if (!user) {
    return <AuthRequired />;
  }

  // Check if user is admin
  if (!user.roles.includes('ROLE_ADMIN')) {
    return <AccessDenied />;
  }

  // Start editing a key
  const handleEdit = (key: string) => {
    setEditingKey(key);
    // Use existing value in txtMap, or try to get default from session storage
    const savedDefaultValue = sessionStorage.getItem('editingTxtValue') || '';
    setEditingValue(txtMap[key] || savedDefaultValue);
    // Clear the saved value after use
    sessionStorage.removeItem('editingTxtValue');
  };

  // Save changes
  const handleSave = async () => {
    if (!editingKey) return;

    setIsSaving(true);
    try {
      await apiPostTxt({
        body: {
          key: editingKey,
          value: editingValue,
        },
      });

      // Update local state
      setTxtMap((prev) => ({
        ...prev,
        [editingKey]: editingValue,
      }));

      setMessage({ text: 'Text updated successfully', type: 'success' });
      setEditingKey(null);
    } catch (error) {
      setMessage({ text: 'Failed to update text', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default (delete custom text)
  const handleReset = async (key: string) => {
    setIsSaving(true);
    try {
      await apiDeleteTxt({
        body: {
          key,
          value: '1',
        },
      });

      // Update local state
      const newTxtMap = { ...txtMap };
      delete newTxtMap[key];
      setTxtMap(newTxtMap);

      setMessage({ text: 'Text reset to default successfully', type: 'success' });
      setEditingKey(null);
    } catch (error) {
      setMessage({ text: 'Failed to reset text', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingKey(null);
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Text Content Management</h1>

      {message && (
        <div
          className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Website Text</h2>
            <p className="text-sm text-gray-500">
              Edit text content that appears throughout the website.
            </p>
          </div>
        </div>

        {/* Special edit form for adding new text */}
        {editingKey && (
          <div className="p-4 border-b bg-green-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Enter a unique key (e.g. hero.subtitle)"
                  value={editingKey}
                  onChange={(e) => setEditingKey(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use dot notation for organization (e.g. section.title)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[150px]"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  placeholder="Enter the text content here..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  onClick={() => {
                    if (editingKey && editingKey !== 'new') {
                      handleSave();
                    } else {
                      setMessage({ text: 'Please enter a valid key', type: 'error' });
                    }
                  }}
                  disabled={isSaving || !editingValue || editingKey === 'new'}
                >
                  {isSaving ? 'Saving...' : 'Save New Text'}
                </button>
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing text entries */}
        <div className="divide-y">
          {Object.keys(txtMap).length > 0 ? (
            Object.entries(txtMap).map(([key, value]) => (
              <div key={key} className="p-4">
                {editingKey === key ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                      <div className="bg-gray-100 p-2 rounded text-gray-700">{key}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[150px]"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{key}</h3>
                        <div className="bg-gray-50 p-3 rounded border text-gray-700 whitespace-pre-wrap">
                          {value}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                          onClick={() => handleEdit(key)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                          onClick={() => handleReset(key)}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No custom text content yet. Click "Add New Text" to create your first entry, or edit
              text on the website.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
