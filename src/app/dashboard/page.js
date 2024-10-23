'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [columns, setColumns] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // TODO: Fetch columns and tasks from the backend
    // If not authenticated, redirect to login
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Your Trello Board</h1>
      <div className="flex space-x-4">
        {columns.map((column) => (
          <div key={column._id} className="bg-gray-200 p-4 rounded-lg w-64">
            <h2 className="font-bold mb-4">{column.title}</h2>
            {/* TODO: Implement tasks within columns */}
          </div>
        ))}
      </div>
    </div>
  );
}
