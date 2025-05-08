import React from 'react';

const UserList = ({ users }) => {
  // Only show users with role 'Member'
  const memberUsers = users.filter(user =>
    (user.role ? user.role === 'Member' : (user.roles ? user.roles.includes('Member') : true))
  );
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member Since
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {memberUsers.map((user) => (
            <tr key={user.userId || user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.userId || user.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList; 