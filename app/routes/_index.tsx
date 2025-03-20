import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/campaigns" 
          className="bg-white shadow rounded p-6 hover:shadow-lg transition-all"
        >
          <h2 className="text-xl font-semibold mb-4">Campaign Management</h2>
          <p>Create, manage, and track your D&D campaigns</p>
        </Link>
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Character Creation</h2>
          <p>Coming Soon: Build and manage your characters</p>
        </div>
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Encounter Builder</h2>
          <p>Coming Soon: Design epic encounters</p>
        </div>
      </div>
    </div>
  );
}
