import { Construction } from 'lucide-react';

const PlaceholderPage = ({ icon: Icon = Construction, title, description }) => (
    <div className="space-y-6 animate-in">
        <div>
            <h1 className="font-display text-[24px] font-extrabold tracking-tight text-[var(--text-primary)] sm:text-[28px]">
                {title}
            </h1>
            {description && (
                <p className="mt-1.5 text-[14px] text-[var(--text-secondary)]">{description}</p>
            )}
        </div>
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F2EAFF] text-[#7C3AED]">
                <Icon className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Coming soon</p>
            <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">
                This section is under development. Check back soon.
            </p>
        </div>
    </div>
);

export default PlaceholderPage;