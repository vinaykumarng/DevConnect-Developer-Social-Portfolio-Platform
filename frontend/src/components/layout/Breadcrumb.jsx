import { Link, useLocation } from 'react-router-dom';

// Optional: map raw path segments to nicer display labels
const labelMap = {
  profile: 'Profile',
  explore: 'Explore',
  posts: 'Posts',
};

export default function Breadcrumb({ customLabels = {} }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null; // don't show on homepage

  return (
    <nav
      aria-label="breadcrumb"
      className="bg-gray-900 border-b border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center flex-wrap text-sm">
          <li>
            <Link
              to="/"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Home
            </Link>
          </li>

          {pathnames.map((segment, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const label = customLabels[segment] || labelMap[segment] || segment;

            return (
              <li key={routeTo} className="flex items-center">
                <span className="mx-2 text-gray-600">/</span>
                {isLast ? (
                  <span className="text-gray-400 capitalize">{label}</span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors capitalize"
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
