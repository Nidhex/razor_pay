import React from 'react';
import { Building2 } from 'lucide-react';
import { CURRENT_MERCHANT_NAME } from '../../config/currentMerchant';

export default function PortalSwitcher({ currentPortal, onPortalChange }) {
  const shortMerchantName = CURRENT_MERCHANT_NAME.split(' ')[0];

  return (
    <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg">
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Merchant Portal</span>
        <span className="hidden sm:inline-block text-[10px] opacity-75 font-normal ml-1 bg-black/20 px-1.5 py-0.5 rounded">{shortMerchantName}</span>
      </div>
    </div>
  );
}
