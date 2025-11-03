import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";

const Header = ({ cartItemCount = 0, onSearch, onCartClick, onMobileMenuToggle }) => {
const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const user = useSelector((state) => state.user.user);
  
  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/category/luxury", label: "Luxury" },
    { href: "/category/sport", label: "Sport" },
    { href: "/category/fashion", label: "Fashion" },
    { href: "/category/smartwatch", label: "Smartwatch" }
  ];
  
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMobileMenuToggle) {
      onMobileMenuToggle(!isMobileMenuOpen);
    }
  };

  const handleSearch = (searchTerm) => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-gray-200/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-accent to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" className="w-5 h-5 text-white" />
            </div>
            <div className="font-display text-xl font-bold text-primary">
              Timepiece Gallery
            </div>
          </Link>

{/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-secondary hover:text-accent transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            {user && (
              <span className="hidden md:block text-sm text-secondary">
                Welcome, {user.firstName || user.name || 'User'}
              </span>
            )}
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-secondary hover:text-accent"
            >
              <ApperIcon name="LogOut" className="w-4 h-4" />
              Logout
            </Button>
            
            {/* Cart Button */}
            <Button
              variant="ghost"
              onClick={onCartClick}
              className="relative"
            >
              <ApperIcon name="ShoppingCart" className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              onClick={handleMobileMenuToggle}
              className="md:hidden"
            >
              <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-5 h-5" />
            </Button>
          </div>
        </div>

          {/* Mobile Search - visible when menu closed */}
          {!isMobileMenuOpen && (
            <div className="md:hidden pb-4">
              <SearchBar onSearch={handleSearch} />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="space-y-3">
{navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-secondary hover:text-accent transition-colors duration-200 font-medium border-b border-gray-100 last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile User Info & Logout */}
              {user && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-secondary mb-2">
                    Welcome, {user.firstName || user.name || 'User'}
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-secondary hover:text-accent transition-colors duration-200 font-medium"
                  >
                    <ApperIcon name="LogOut" className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;