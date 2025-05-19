import React from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

function NavList({ isMobile = false }) {
  return (
    <ul className={`${isMobile ? "flex flex-col gap-4 p-4" : "hidden lg:flex lg:items-center lg:gap-6"}`}>
      <li className="p-1">
        <a href="#" className="font-medium text-gray-700 hover:text-blue-500 transition-colors flex items-center">
          Pages
        </a>
      </li>
      <li className="p-1">
        <a href="#" className="font-medium text-gray-700 hover:text-blue-500 transition-colors flex items-center">
          Account
        </a>
      </li>
      <li className="p-1">
        <a href="#" className="font-medium text-gray-700 hover:text-blue-500 transition-colors flex items-center">
          Blocks
        </a>
      </li>
      <li className="p-1">
        <a href="#" className="font-medium text-gray-700 hover:text-blue-500 transition-colors flex items-center">
          Docs
        </a>
      </li>
    </ul>
  );
}

export function NavbarSimple() {
  const [openNav, setOpenNav] = React.useState(false);

  const handleWindowResize = () => {
    if (window.innerWidth >= 960) {
      setOpenNav(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <nav className="bg-white shadow-sm mx-auto max-w-screen-xl px-6 py-3">
      <div className="flex items-center justify-between text-gray-900">
        <a href="#" className="text-xl font-semibold cursor-pointer py-1.5 mr-4">
          My App
        </a>
        
        <NavList />
        
        <button
          className="lg:hidden ml-auto h-6 w-6 text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      <div className={`lg:hidden ${openNav ? "block" : "hidden"}`}>
        <NavList isMobile />
      </div>
    </nav>
  );
}
