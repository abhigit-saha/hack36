'use client'

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Leaf, Heart, User } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Function to check if a link is active
  const isActive = (path) => pathname === path

  return (
    <nav className="bg-gradient-to-r from-[#FFF5F2] to-[#F0F9F5] backdrop-blur-sm sticky top-0 z-50 border-b border-[#F8B195]/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
        {/* Logo with leaf icon */}
        <div className="flex items-center">
          <div className="mr-2 text-[#4FB286]">
            <Heart className="h-5 w-5 fill-[#F67280] stroke-[#F67280]" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#F67280] to-[#4FB286] bg-clip-text text-transparent">
            CareConnect
          </h1>

          {/* Decorative element */}
          <div className="absolute left-32 top-1/2 -translate-y-1/2 w-24 h-[1px] bg-gradient-to-r from-[#F8B195]/20 to-transparent hidden md:block"></div>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-1 text-[#3A4F41] font-medium">
          {[
            { href: "/", label: "Home" },
            { href: "/appointments", label: "Appointments" },
            { href: "/doctors", label: "Doctors" },
            { href: "/physio", label: "Physio" },
            { href: "/reports", label: "Reports" },
            { href: "/profile", label: "Profile" }
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                isActive(link.href)
                  ? "bg-[#F8B195]/10 text-[#F67280] font-semibold"
                  : "hover:bg-[#96E6B3]/10 hover:text-[#4FB286]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User profile avatar if logged in */}
        {user ? (
          <div className="hidden md:flex items-center ml-4">
            <div className="bg-gradient-to-r from-[#F8B195] to-[#F67280] p-[1px] rounded-full">
              <div className="bg-white p-[2px] rounded-full">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-r from-[#F8B195] to-[#F67280] text-white font-bold">
                  {user.name?.charAt(0) || "U"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="hidden md:block bg-gradient-to-r from-[#F8B195] to-[#F67280] text-white px-4 py-2 rounded-full font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300"
          >
            Sign In
          </Link>
        )}

        {/* Hamburger icon */}
        <button
          className="md:hidden focus:outline-none z-50 w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F8B195]/10 transition-colors duration-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="h-5 w-5 text-[#F67280]" />
          ) : (
            <Menu className="h-5 w-5 text-[#3A4F41]" />
          )}
        </button>
      </div>

      {/* Slide-in mobile menu from right */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-[#FFF5F2] to-[#F0F9F5] shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        {/* Mobile menu decorative elements */}
        <div className="absolute top-10 right-10 text-[#96E6B3]/10">
          <Leaf size={120} />
        </div>
        <div className="absolute bottom-10 left-5 w-16 h-16 bg-[#F8B195]/10 rounded-full"></div>

        {/* User info in mobile menu */}
        {user ? (
          <div className="px-6 pt-16 pb-6 border-b border-[#F8B195]/10 flex items-center">
            <div className="bg-gradient-to-r from-[#F8B195] to-[#F67280] p-[1px] rounded-full mr-3">
              <div className="bg-white p-[2px] rounded-full">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#F8B195] to-[#F67280] text-white font-bold">
                  {user.name?.charAt(0) || "U"}
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium text-[#3A4F41]">{user.name || "User"}</p>
              <p className="text-xs text-[#5D7A64]">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="px-6 pt-16 pb-6 border-b border-[#F8B195]/10">
            <Link
              href="/login"
              className="block bg-gradient-to-r from-[#F8B195] to-[#F67280] text-white px-4 py-2 rounded-full font-medium text-center shadow-sm"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Mobile menu links */}
        <div className="relative z-10 flex flex-col px-3 py-6 space-y-1">
          {[
            { href: "/", label: "Home", icon: <Leaf className="h-4 w-4" /> },
            { href: "/appointments", label: "Appointments", icon: <Calendar className="h-4 w-4" /> },
            { href: "/doctors", label: "Doctors", icon: <Stethoscope className="h-4 w-4" /> },
            { href: "/physio", label: "Physio", icon: <Activity className="h-4 w-4" /> },
            { href: "/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
            { href: "/profile", label: "Profile", icon: <User className="h-4 w-4" /> }
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive(link.href)
                  ? "bg-[#F8B195]/10 text-[#F67280] font-semibold"
                  : "hover:bg-[#96E6B3]/10 hover:text-[#4FB286] text-[#3A4F41]"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <span className={`mr-3 ${isActive(link.href) ? "text-[#F67280]" : "text-[#5D7A64]"}`}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Footer in mobile menu */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-[#5D7A64]">
          <p>© {new Date().getFullYear()} CareConnect</p>
          <p className="mt-1">Healing through compassion</p>
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </nav>
  )
}

// Import these icons at the top
function Calendar(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function Stethoscope(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

function Activity(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function FileText(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}