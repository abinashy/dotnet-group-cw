import React from 'react';
import UsersGrid from '../../components/Staff/UsersGrid';

export default function StaffUsers() {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Users Management</h1>
      </div>
      <UsersGrid />
    </div>
  );
} 