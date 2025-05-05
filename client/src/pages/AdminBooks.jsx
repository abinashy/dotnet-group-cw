import AddBookForm from '../components/Admin/AddBookForm';

export default function AdminBooks() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-6">Manage Books</h1>
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <AddBookForm />
          </div>
          {/* TODO: Add books table here */}
        </div>
      </main>
    </div>
  );
} 