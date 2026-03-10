import { Outlet } from 'react-router';
import { Sidebar } from '../components/sidebar';

export function Root() {
  return (
    <div className="flex min-h-screen bg-[#E0E5EC]">
      <Sidebar />
      <main className="ml-72 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}