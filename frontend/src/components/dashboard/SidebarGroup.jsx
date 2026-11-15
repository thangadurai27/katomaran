import SidebarItem from './SidebarItem';

const SidebarGroup = ({ group, collapsed, onNavigate }) => (
    <div className="space-y-1.5">
        {!collapsed && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {group.label}
            </p>
        )}
        <ul className="space-y-1">
            {group.items.map((item) => (
                <SidebarItem key={item.path} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
        </ul>
    </div>
);

export default SidebarGroup;