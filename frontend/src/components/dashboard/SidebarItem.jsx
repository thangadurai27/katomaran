import { NavLink } from 'react-router-dom';

const SidebarItem = ({ item, collapsed, onNavigate }) => {
    const Icon = item.icon;
    return (
        <li>
            <NavLink
                to={item.path}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                    `group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-all duration-200 ${
                        isActive
                            ? 'bg-[#F2EAFF] text-[#7C3AED] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]'
                    } ${collapsed ? 'justify-center px-0' : ''}`
                }
            >
                {({ isActive }) => (
                    <>
                        <Icon
                            className="h-5 w-5 shrink-0"
                            strokeWidth={isActive ? 2.2 : 1.9}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {item.badge && !collapsed && (
                            <span className="ml-auto rounded-md bg-[var(--brand-light)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--brand-primary)]">
                                {item.badge}
                            </span>
                        )}
                    </>
                )}
            </NavLink>
        </li>
    );
};

export default SidebarItem;