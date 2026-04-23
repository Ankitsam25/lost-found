import React, { useState, useEffect, useCallback } from 'react';
import { getAllItems, addItem, updateItem, deleteItem, searchItems } from '../utils/api';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Accessories', 'Documents', 'Keys', 'Other'];

const initialFormState = {
  itemName: '', description: '', type: 'Lost', category: 'Other',
  location: '', date: new Date().toISOString().slice(0, 10), contactInfo: ''
};

const Dashboard = ({ user, onLogout }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editItem, setEditItem] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.name = searchQuery;
      if (filterCategory !== 'All') params.category = filterCategory;
      if (filterType !== 'All') params.type = filterType;

      const res = (searchQuery || filterCategory !== 'All' || filterType !== 'All')
        ? await searchItems(params)
        : await getAllItems();

      setItems(res.data.items || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterCategory, filterType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.description || !formData.location || !formData.contactInfo) {
      return setFormError('Please fill in all required fields.');
    }
    setSubmitting(true);
    setFormError('');
    try {
      await addItem(formData);
      setFormSuccess('Item reported successfully!');
      setFormData(initialFormState);
      setShowAddForm(false);
      fetchItems();
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add item.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditItem({ ...item, date: new Date(item.date).toISOString().slice(0, 10) });
    setShowEditModal(true);
    setFormError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await updateItem(editItem._id, editItem);
      setShowEditModal(false);
      setFormSuccess('Item updated successfully!');
      fetchItems();
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setDeleteConfirm(null);
      setFormSuccess('Item deleted successfully!');
      fetchItems();
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const lostCount = items.filter(i => i.type === 'Lost').length;
  const foundCount = items.filter(i => i.type === 'Found').length;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-custom">
        <div className="container">
          <span className="navbar-brand">
            <i className="bi bi-search-heart me-2"></i>Lost & Found
          </span>
          <div className="d-flex align-items-center gap-3">
            <span className="nav-user d-none d-sm-block">
              <i className="bi bi-person-circle me-1"></i>{user.name}
            </span>
            <button className="btn btn-logout" onClick={onLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-main">
        <div className="container">
          {/* Global success message */}
          {formSuccess && (
            <div className="alert alert-success alert-dismissible" role="alert">
              <i className="bi bi-check-circle me-2"></i>{formSuccess}
              <button type="button" className="btn-close" onClick={() => setFormSuccess('')}></button>
            </div>
          )}

          {/* Stats Row */}
          <div className="row mb-3">
            <div className="col-4">
              <div className="stat-card total">
                <div className="stat-number">{items.length}</div>
                <div className="stat-label">Total Items</div>
              </div>
            </div>
            <div className="col-4">
              <div className="stat-card lost">
                <div className="stat-number">{lostCount}</div>
                <div className="stat-label">Lost Items</div>
              </div>
            </div>
            <div className="col-4">
              <div className="stat-card found">
                <div className="stat-number">{foundCount}</div>
                <div className="stat-label">Found Items</div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="search-section">
            <h5><i className="bi bi-funnel me-2"></i>Search & Filter</h5>
            <div className="row g-2">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search by name, description, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select className="form-select" value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select" value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}>
                  <option>All</option>
                  <option>Lost</option>
                  <option>Found</option>
                </select>
              </div>
              <div className="col-md-2">
                <button className="btn w-100" style={{ background: '#e2e8f0', borderRadius: '8px' }}
                  onClick={() => { setSearchQuery(''); setFilterCategory('All'); setFilterType('All'); }}>
                  <i className="bi bi-x-circle me-1"></i>Clear
                </button>
              </div>
            </div>
          </div>

          {/* Add Item Section */}
          <div className="form-card">
            <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: showAddForm ? '20px' : '0', paddingBottom: showAddForm ? '12px' : '0', borderBottom: showAddForm ? '2px solid #f0f4f8' : 'none' }}>
              <h5 style={{ margin: 0, padding: 0, border: 'none' }}>
                <i className="bi bi-plus-circle me-2"></i>Report an Item
              </h5>
              <button className="btn btn-primary-custom btn-sm"
                onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : '+ Add Item'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddSubmit}>
                {formError && !showEditModal && (
                  <div className="alert alert-danger mb-3">
                    <i className="bi bi-exclamation-circle me-2"></i>{formError}
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Item Name *</label>
                    <input className="form-control mt-1" name="itemName" placeholder="e.g. Black Wallet"
                      value={formData.itemName} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-3">
                    <label>Type *</label>
                    <select className="form-select mt-1" name="type" value={formData.type} onChange={handleFormChange}>
                      <option>Lost</option>
                      <option>Found</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label>Category</label>
                    <select className="form-select mt-1" name="category" value={formData.category} onChange={handleFormChange}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label>Description *</label>
                    <textarea className="form-control mt-1" name="description" rows="2"
                      placeholder="Describe the item in detail..."
                      value={formData.description} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label>Location *</label>
                    <input className="form-control mt-1" name="location" placeholder="e.g. Library, Block A"
                      value={formData.location} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label>Date *</label>
                    <input type="date" className="form-control mt-1" name="date"
                      value={formData.date} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label>Contact Info *</label>
                    <input className="form-control mt-1" name="contactInfo" placeholder="Phone / Email"
                      value={formData.contactInfo} onChange={handleFormChange} />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                      {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : <><i className="bi bi-send me-2"></i>Submit Report</>}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Items List */}
          <h5 className="mb-3 fw-bold" style={{ color: '#4a5568' }}>
            <i className="bi bi-grid me-2"></i>All Items
            <span className="badge ms-2" style={{ background: '#667eea', fontSize: '13px' }}>{items.length}</span>
          </h5>

          {loading ? (
            <div className="spinner-container">
              <div className="spinner-border" style={{ color: '#667eea', width: '50px', height: '50px' }}></div>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <h5>No items found</h5>
              <p>Try different search terms or be the first to report an item.</p>
            </div>
          ) : (
            <div className="row">
              {items.map(item => (
                <div key={item._id} className="col-md-6 col-lg-4">
                  <div className="item-card">
                    <div className={`card-header-custom ${item.type === 'Lost' ? 'lost' : 'found'}`}>
                      <i className={`bi ${item.type === 'Lost' ? 'bi-search' : 'bi-check-circle'} me-2`}></i>
                      {item.type} Item
                    </div>
                    <div className="card-body">
                      <div className="item-title">{item.itemName}</div>
                      <p className="item-meta" style={{ color: '#555', marginBottom: '10px' }}>
                        {item.description}
                      </p>
                      <div className="item-meta"><i className="bi bi-tag me-1"></i>{item.category}</div>
                      <div className="item-meta"><i className="bi bi-geo-alt me-1"></i>{item.location}</div>
                      <div className="item-meta"><i className="bi bi-calendar me-1"></i>
                        {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="item-meta"><i className="bi bi-telephone me-1"></i>{item.contactInfo}</div>
                      <div className="item-meta"><i className="bi bi-person me-1"></i>By: {item.reporterName}</div>

                      {/* Owner controls */}
                      {item.reportedBy === user.id && (
                        <div className="owner-actions">
                          <button className="btn btn-sm btn-outline-primary flex-fill"
                            onClick={() => openEditModal(item)}>
                            <i className="bi bi-pencil me-1"></i>Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger flex-fill"
                            onClick={() => setDeleteConfirm(item._id)}>
                            <i className="bi bi-trash me-1"></i>Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-pencil me-2"></i>Edit Item</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {formError && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>{formError}
                  </div>
                )}
                <form onSubmit={handleEditSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="fw-semibold">Item Name</label>
                      <input className="form-control mt-1" value={editItem.itemName}
                        onChange={(e) => setEditItem({ ...editItem, itemName: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="fw-semibold">Type</label>
                      <select className="form-select mt-1" value={editItem.type}
                        onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}>
                        <option>Lost</option>
                        <option>Found</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="fw-semibold">Category</label>
                      <select className="form-select mt-1" value={editItem.category}
                        onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="fw-semibold">Description</label>
                      <textarea className="form-control mt-1" rows="2" value={editItem.description}
                        onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="fw-semibold">Location</label>
                      <input className="form-control mt-1" value={editItem.location}
                        onChange={(e) => setEditItem({ ...editItem, location: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="fw-semibold">Date</label>
                      <input type="date" className="form-control mt-1" value={editItem.date}
                        onChange={(e) => setEditItem({ ...editItem, date: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="fw-semibold">Contact Info</label>
                      <input className="form-control mt-1" value={editItem.contactInfo}
                        onChange={(e) => setEditItem({ ...editItem, contactInfo: e.target.value })} />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                      {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-save me-2"></i>Save Changes</>}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' }}>
                <h5 className="modal-title text-white"><i className="bi bi-exclamation-triangle me-2"></i>Confirm Delete</h5>
                <button className="btn-close" onClick={() => setDeleteConfirm(null)}></button>
              </div>
              <div className="modal-body text-center p-4">
                <i className="bi bi-trash" style={{ fontSize: '48px', color: '#ee5a24' }}></i>
                <p className="mt-3 mb-0">Are you sure you want to delete this item? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
