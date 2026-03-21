import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <>
      <Header />
      <main className="pt-6 px-6 md:px-10 pb-12 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </>
  );
}
