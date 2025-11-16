import React from 'react';
import { X, UserCircle } from 'lucide-react';
import { UTOPHIA_COLOR, navItems, secondaryNavItems } from '../../config/constants';
const NavLink = ({ item, currentPage, onNavigate, isSecondary = false }) => {
    const isActive = currentPage === item.path;
    const baseClasses = "flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full text-left";
    const activeClasses = `bg-indigo-100 text-indigo-700`; 
    const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-800";
    
    return (
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate(item.path); }}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isSecondary ? 'text-sm' : ''}`}
        >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
        </a>
    );
};

const Sidebar = ({ user, currentPage, onNavigate, isMenuOpen, onMenuClose }) => {
    const BRAND_COLOR_CLASS = 'text-indigo-600'; 
    
    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onMenuClose}
            />

            <aside
                className={`
                    h-full w-64 bg-white shadow-xl z-50 transition-transform duration-300
                    /* Styles pour Mobile (< lg) */
                    ${isMenuOpen ? 'fixed top-0 left-0 translate-x-0' : 'fixed top-0 left-0 -translate-x-full'}
                    /* Styles pour Desktop (>= lg) */
                    lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:border-r lg:translate-x-0
                `}
            >
                <div className="p-4 flex justify-between items-center border-b border-gray-100 lg:hidden">
                
                    <h2 className={`text-xl font-extrabold ${BRAND_COLOR_CLASS}`}>UtopiaHire</h2>
                    <button onClick={onMenuClose} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex flex-col h-full">
              
                    <nav className="p-4 space-y-2 flex-1 pt-6">
                        {navItems.map((item) => (
                            <NavLink key={item.path} item={item} currentPage={currentPage} onNavigate={onNavigate} />
                        ))}
                    </nav>
                    <div className="p-4 border-t border-gray-100 space-y-2">
                        {user && (
                            <NavLink 
                                item={{ name: 'Mon Profil', path: '/profile', icon: UserCircle }} 
                                currentPage={currentPage} 
                                onNavigate={onNavigate} 
                                isSecondary={true}
                            />
                        )}
                        {secondaryNavItems.map(item => (
                            <NavLink key={item.path} item={item} currentPage={currentPage} onNavigate={onNavigate} isSecondary={true} />
                        ))}
                    </div>

                </div>
            </aside>
        </>
    );
};

export default Sidebar;