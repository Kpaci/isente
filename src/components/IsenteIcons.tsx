import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  color?: string;
}

/**
 * Isente Primary Brand Logo
 * Geometric letter 'i' intersecting a kinetic financial orbit ribbon
 */
export const IsenteLogoIcon: React.FC<IconProps> = ({ size = 28, className = '', ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      <linearGradient id="isenteGradPrimary" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#05F292" />
        <stop offset="0.5" stopColor="#10B981" />
        <stop offset="1" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="isenteOrbitGrad" x1="2" y1="16" x2="30" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" stopOpacity="0.8" />
        <stop offset="0.5" stopColor="#05F292" />
        <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    {/* Central Pillar (Letter i body) */}
    <rect x="13.5" y="12" width="5" height="15" rx="2.5" fill="url(#isenteGradPrimary)" />
    {/* Diamond Head (Letter i dot) */}
    <rect x="13.5" y="5" width="5" height="5" rx="1.5" transform="rotate(45 16 7.5)" fill="#05F292" />
    {/* Elliptical Cash Flow Orbit */}
    <ellipse cx="16" cy="19.5" rx="13" ry="5.5" stroke="url(#isenteOrbitGrad)" strokeWidth="2.2" strokeLinecap="round" transform="rotate(-18 16 19.5)" />
    {/* Orbit Spark */}
    <circle cx="26.5" cy="15.5" r="1.8" fill="#FFFFFF" />
  </svg>
);

/** Dashboard Overview Icon */
export const DashboardIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="3" width="7" height="9" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="14" y="3" width="7" height="5" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="14" y="12" width="7" height="9" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="3" y="16" width="7" height="5" rx="2" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

/** Activity / Transactions Flow Icon */
export const TransactionsIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 3v14M17 17l4-4M17 17l-4-4" stroke="#05F292" />
    <path d="M7 21V7M7 7L3 11M7 7l4 4" stroke="#8B5CF6" />
  </svg>
);

/** Smart SMS Scan / Ingest Icon */
export const MoMoScanIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4 7V4h3M17 4h3v3M4 17v3h3M20 17v3h-3" stroke="currentColor" strokeOpacity="0.6" />
    <rect x="7" y="7" width="10" height="10" rx="3" fill="#05F292" fillOpacity="0.2" stroke="#05F292" />
    <path d="M10 12h4M12 10v4" stroke="#05F292" strokeWidth="2.2" />
  </svg>
);

/** Debts / Peer-to-Peer Loans Icon */
export const DebtsIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="9" cy="7" r="4" fill="currentColor" fillOpacity="0.15" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 11l3 3 5-5" stroke="#05F292" strokeWidth="2.2" />
  </svg>
);

/** Savings Targets / Wealth Goals Icon */
export const GoalsIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#8B5CF6" strokeOpacity="0.5" />
    <circle cx="12" cy="12" r="6" fill="#05F292" fillOpacity="0.2" stroke="#05F292" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="2" fill="#05F292" />
  </svg>
);

/** Cash Outflow / Expense Icon */
export const ExpenseIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M7 7h10v10M7 17L17 7" stroke="#F43F5E" />
  </svg>
);

/** Cash Inflow / Income Icon */
export const IncomeIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 17H7V7M17 7L7 17" stroke="#05F292" />
  </svg>
);

/** Lightning / Automated SMS Detection Icon */
export const SparkIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#05F292" stroke="#05F292" />
  </svg>
);

/** Wallet Vault Icon */
export const WalletVaultIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="2" y="5" width="20" height="14" rx="3" fill="currentColor" fillOpacity="0.1" />
    <path d="M2 10h20" stroke="currentColor" strokeOpacity="0.4" />
    <circle cx="17" cy="14" r="2" fill="#05F292" stroke="#05F292" />
  </svg>
);

/** Category Preset Icons */
export const CategoryIcons = {
  rent: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#6366F1" fillOpacity="0.2" stroke="#6366F1" />
      <polyline points="9 22 9 12 15 12 15 22" stroke="#6366F1" />
    </svg>
  ),
  food: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" />
      <line x1="6" y1="1" x2="6" y2="4" stroke="#F59E0B" />
      <line x1="10" y1="1" x2="10" y2="4" stroke="#F59E0B" />
      <line x1="14" y1="1" x2="14" y2="4" stroke="#F59E0B" />
    </svg>
  ),
  communication: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="2" width="14" height="20" rx="3" fill="#06B6D4" fillOpacity="0.2" stroke="#06B6D4" />
      <line x1="12" y1="18" x2="12.01" y2="18" stroke="#06B6D4" strokeWidth="3" />
    </svg>
  ),
  transportation: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="12" rx="2" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" />
      <circle cx="7" cy="18" r="2" fill="#3B82F6" />
      <circle cx="17" cy="18" r="2" fill="#3B82F6" />
    </svg>
  ),
  groceries: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="21" r="1" fill="#10B981" />
      <circle cx="20" cy="21" r="1" fill="#10B981" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="#10B981" />
    </svg>
  ),
  utilities: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#EAB308" fillOpacity="0.2" stroke="#EAB308" />
    </svg>
  ),
  healthcare: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v20M2 12h20" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  entertainment: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" />
      <circle cx="8" cy="12" r="2" fill="#8B5CF6" />
      <line x1="16" y1="10" x2="16" y2="10.01" stroke="#8B5CF6" strokeWidth="3" />
      <line x1="18" y1="12" x2="18.01" y2="12" stroke="#8B5CF6" strokeWidth="3" />
    </svg>
  ),
  shopping: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="#14B8A6" fillOpacity="0.2" stroke="#14B8A6" />
      <line x1="3" y1="6" x2="21" y2="6" stroke="#14B8A6" />
      <path d="M16 10a4 4 0 0 1-8 0" stroke="#14B8A6" />
    </svg>
  ),
  other: ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1" fill="#94A3B8" />
      <circle cx="19" cy="12" r="1" fill="#94A3B8" />
      <circle cx="5" cy="12" r="1" fill="#94A3B8" />
      <circle cx="12" cy="12" r="9" stroke="#94A3B8" />
    </svg>
  ),
};
