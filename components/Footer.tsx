export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Medical Clinic</h3>
            <p className="text-gray-400">
              Providing quality healthcare services for your family.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-white">
                  Register
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-400">
              📍 123 Medical Street, Health City
              <br />
              📞 (555) 123-4567
              <br />
              ✉️ info@medicalclinic.com
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Medical Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

