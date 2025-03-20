import { Link } from 'react-router';
import { useCurrentUser } from '~/context/UserContext';
import type { UserDto } from '~/api/apiSchemas';

export function Navbar() {
  const { user } = useCurrentUser();

  return (
    <nav className="bg-white py-4 shadow-sm text-gray-900">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link prefetch={'intent'} to={'/'} className="font-bold text-xl text-blue-600">
            Mandates.io
          </Link>
        </div>

        <div className="hidden md:flex space-x-6">
          <Link prefetch={'intent'} to={'/'} className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link prefetch={'intent'} to="/mandates" className="text-gray-700 hover:text-blue-600">
            Mandates
          </Link>
          <Link prefetch={'intent'} to="/about" className="text-gray-700 hover:text-blue-600">
            About
          </Link>
          <Link prefetch={'intent'} to="/contact" className="text-gray-700 hover:text-blue-600">
            Contact
          </Link>
        </div>

        {user ? <UserButtons user={user} /> : <GuestButtons />}
      </div>
    </nav>
  );
}

function GuestButtons() {
  return (
    <div className="flex items-center space-x-4">
      <Link prefetch={'intent'} to="/login" className="text-blue-600 hover:text-blue-800">
        Login
      </Link>
      <Link
        prefetch={'intent'}
        to="/investor/register"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Register
      </Link>
    </div>
  );
}

function UserButtons({ user }: { user: UserDto }) {
  return (
    <div className="flex items-center space-x-4">
      <Link prefetch={'intent'} to="/dashboard" className="text-blue-600 hover:text-blue-800">
        Dashboard
      </Link>
    </div>
  );
}
