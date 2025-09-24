// src/App.js
import "./App.css";

import React, { useEffect, useState } from "react";
import {
  getApplications,
  addApplication,
  updateApplication,
  deleteApplication,
} from "./api";

function App() {
  const [applications, setApplications] = useState([]);
  
  // Add form states
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState("Applied");
  const [newNotes, setNewNotes] = useState("");
  
  // Edit form states
  const [editingId, setEditingId] = useState(null);
  const [editingCompany, setEditingCompany] = useState("");
  const [editingRole, setEditingRole] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [editingStatus, setEditingStatus] = useState("");
  const [editingNotes, setEditingNotes] = useState("");

  // Fetch applications
  const fetchApplications = async () => {
    const data = await getApplications();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Add new application
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;
    
    await addApplication({
      company: newCompany,
      role: newRole,
      date_applied: newDate || null,
      status: newStatus,
      notes: newNotes || null,
    });
    
    // Clear form
    setNewCompany("");
    setNewRole("");
    setNewDate("");
    setNewStatus("Applied");
    setNewNotes("");
    fetchApplications();
  };

  // Start inline edit
  const handleEdit = (app) => {
    setEditingId(app.id);
    setEditingCompany(app.company);
    setEditingRole(app.role);
    setEditingDate(app.date_applied || "");
    setEditingStatus(app.status);
    setEditingNotes(app.notes || "");
  };

  // Save inline edit
  const handleSave = async (id) => {
    await updateApplication(id, {
      company: editingCompany,
      role: editingRole,
      date_applied: editingDate || null,
      status: editingStatus,
      notes: editingNotes || null,
    });
    setEditingId(null);
    fetchApplications();
  };

  // Cancel inline edit
  const handleCancel = () => {
    setEditingId(null);
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      await deleteApplication(id);
      fetchApplications();
    }
  };

  return (
    <div className="container">
      <h1>Job Tracker</h1>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          placeholder="Company Name"
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Job Role"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          required
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <textarea
          placeholder="Notes (optional)"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          rows="1"
        />
        <button type="submit" className="add">
          Add
        </button>
      </form>

      <ul>
        {applications.length > 0 ? (
          applications.map((app) => (
            <li key={app.id}>
              {editingId === app.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editingCompany}
                    onChange={(e) => setEditingCompany(e.target.value)}
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={editingRole}
                    onChange={(e) => setEditingRole(e.target.value)}
                    placeholder="Role"
                  />
                  <input
                    type="date"
                    value={editingDate}
                    onChange={(e) => setEditingDate(e.target.value)}
                  />
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Notes"
                    rows="2"
                  />
                  <div className="edit-buttons">
                    <button onClick={() => handleSave(app.id)} className="save">
                      Save
                    </button>
                    <button onClick={handleCancel} className="cancel">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="app-display">
                  <div className="app-info">
                    <div className="app-main">
                      <strong>{app.company}</strong> - {app.role}
                    </div>
                    <div className="app-details">
                      <span className={`status ${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                      <span className="date">
                        {app.date_applied || "No date"}
                      </span>
                    </div>
                    {app.notes && (
                      <div className="app-notes">{app.notes}</div>
                    )}
                  </div>
                  <div className="app-buttons">
                    <button
                      onClick={() => handleEdit(app)}
                      className="edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <p>No applications found</p>
        )}
      </ul>
    </div>
  );
}

export default App;