import React, { useState } from 'react';
import { Contact } from '../types/Contact';

interface ContactListProps {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      onUpdateContact({
        ...editingContact,
        ...formData,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        updatedAt: new Date(),
      });
      setEditingContact(null);
    } else {
      onAddContact({
        ...formData,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });
    }
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      notes: '',
      category: '',
    });
    setShowAddForm(false);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber || '',
      email: contact.email || '',
      street: contact.address?.street || '',
      city: contact.address?.city || '',
      state: contact.address?.state || '',
      zipCode: contact.address?.zipCode || '',
      country: contact.address?.country || '',
      notes: contact.notes || '',
      category: contact.category || '',
    });
    setShowAddForm(true);
  };

  return (
    <div className="contact-list">
      <div className="contact-header">
        <h2>Contacts</h2>
        <button 
          className="add-contact-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Contact'}
        </button>
      </div>

      {showAddForm && (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name*</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input
                type="text"
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {editingContact ? 'Update Contact' : 'Add Contact'}
          </button>
        </form>
      )}

      <div className="contacts-grid">
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-card">
            <div className="contact-card-header">
              <h3>{contact.name}</h3>
              <div className="contact-actions">
                <button onClick={() => handleEdit(contact)}>Edit</button>
                <button onClick={() => onDeleteContact(contact.id)}>Delete</button>
              </div>
            </div>
            
            {contact.phoneNumber && (
              <p className="contact-detail">
                <span className="icon">📱</span> {contact.phoneNumber}
              </p>
            )}
            
            {contact.email && (
              <p className="contact-detail">
                <span className="icon">📧</span> {contact.email}
              </p>
            )}
            
            {contact.address && (
              <p className="contact-detail">
                <span className="icon">📍</span>
                {[
                  contact.address.street,
                  contact.address.city,
                  contact.address.state,
                  contact.address.zipCode,
                  contact.address.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            
            {contact.notes && (
              <p className="contact-notes">
                <span className="icon">📝</span> {contact.notes}
              </p>
            )}
            
            {contact.category && (
              <span className="contact-category">
                {contact.category}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList; 