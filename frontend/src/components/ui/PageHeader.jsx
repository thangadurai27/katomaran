import React from 'react';

const PageHeader = ({ title, subtitle, action, badge }) => (
    <div className="page-header flex-col xs:flex-row xs:items-end gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
            {badge && <span className="badge-primary mb-2 inline-flex">{badge}</span>}
            <h1 className="page-title text-fluid-2xl sm:text-2xl">{title}</h1>
            {subtitle && <p className="page-subtitle text-fluid-sm">{subtitle}</p>}
        </div>
        {action && <div className="page-header-actions w-full xs:w-auto shrink-0 [&_.btn-primary]:w-full xs:[&_.btn-primary]:w-auto">{action}</div>}
    </div>
);

export default PageHeader;
