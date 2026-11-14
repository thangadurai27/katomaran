import React from 'react';

const StatCard = ({ icon: Icon, label, value, iconBg = 'bg-primary/10', iconColor = 'text-primary', delay = 0, change }) => {
    const staggerClass = `opacity-0 translate-y-1 transition-all duration-500 ease-out stagger-${delay}`;
    
    return (
        <div className="group flex-1 p-4 rounded-lg bg-white shadow-sm opacity-0 translate-y-1 transition-all duration-500 ease-out stagger-0">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 ${iconColor}`}>
                <Icon />
            </div>
            <h3 className="text-lg font-medium text-slate-900">{label}</h3>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change !== undefined && <p className="text-sm text-slate-500">+{change}</p>}
        </div>
    );
};

StatCard.defaultProps = {
    change: undefined,
};

export default StatCard;