import { Link } from 'react-router';


export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Mandates.io
            </h3>
            <p className="text-gray-300 text-sm">
                Connecting qualified investors with exclusive investment opportunities worldwide.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link prefetch={'intent'} to="/" className="text-gray-300 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  prefetch={'intent'}
                  to="/about"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  prefetch={'intent'}
                  to="/contact"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  prefetch={'intent'}
                  to="/faq"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              For Investors
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  prefetch={'intent'}
                  to="/mandate/submit"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Submit Mandate
                </Link>
              </li>
              <li>
                <Link
                  prefetch={'intent'}
                  to="/how-it-works"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  prefetch={'intent'}
                  to="/success-stories"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              For Deal Sponsors
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  prefetch={'intent'}
                  to="/submit-deal"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Submit a Deal
                </Link>
              </li>
              <li>
                <Link
                  prefetch={'intent'}
                  to="/mandates"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Browse Mandates
                </Link>
              </li>
              <li>
                <Link
                  prefetch={'intent'}
                  to="/resources"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Mandates.io. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              prefetch={'intent'}
              to="/privacy"
              className="text-gray-400 hover:text-white text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              prefetch={'intent'}
              to="/terms"
              className="text-gray-400 hover:text-white text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
