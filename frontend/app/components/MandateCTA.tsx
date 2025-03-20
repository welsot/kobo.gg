import { Link } from 'react-router';

export function MandateCTA() {
  return (
    <div className="flex space-x-4">
      <Link
        to="/mandate/submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Submit Mandate
      </Link>
    </div>
  );
}
