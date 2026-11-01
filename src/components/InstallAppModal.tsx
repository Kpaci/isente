import React, { useState, useEffect } from 'react';
import { usePWAInstall, BeforeInstallPromptEvent } from '../hooks/usePWAInstall';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { 
  Download, 
  X, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Zap,
  ExternalLink,
  Info
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose, onSuccessToast }) => {
  const { isInstallable, isInstalled, isIOS, isIframe, executeInstall } = usePWAInstall();

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const handleExecuteInstall = async () => {
    const res = await executeInstall();
    if (res.success) {
      onSuccessToast?.('MoMoPay successfully installed to your device!');
      onClose();
      return;
    }
    if (res.launchedTopWindow) {
      onSuccessToast?.('Opening MoMoPay in Chrome to trigger native Android install...');
      onClose();
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-snug">
                Install MoMoPay App
              </h3>
              <p className="text-xs text-slate-400">
                PWA Home Screen Installation for Android & Desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Status Badge if already installed */}
          {isInstalled && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">App Already Installed</p>
                <p className="text-[11px] text-emerald-300/80">You are already running MoMoPay as an installed application.</p>
              </div>
            </div>
          )}

          {/* Iframe Detection Notice */}
          {isIframe && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Info className="w-4 h-4" />
                <span>Android Chrome Installation Notice</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Android Chrome restricts PWA installation inside embedded preview frames. Tap below to launch MoMoPay directly in your Chrome browser where the install prompt and 3-dots menu activate:
              </p>
              <button
                type="button"
                onClick={handleExecuteInstall}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                <span>Launch in Chrome to Install</span>
              </button>
            </div>
          )}

          {/* Direct Execute Install Action */}
          {!isInstalled && !isIframe && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Zap className="w-4 h-4" /> Native PWA Ready
              </span>
              <button
                type="button"
                onClick={handleExecuteInstall}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Execute Android App Installation Now</span>
              </button>
              <p className="text-[11px] text-slate-400">
                Installs MoMoPay directly to your Android launcher with offline capability.
              </p>
            </div>
          )}

          {/* Android Chrome 3-Dots Instructions */}
          {!isIOS && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🤖</span>
                  <h4 className="text-xs font-bold text-slate-200">
                    Android Phone (Chrome / Firefox / Edge)
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  Android
                </span>
              </div>

              <ol className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white">three dots menu (⋮)</strong> in the top-right corner of Chrome.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-amber-400">Install</strong>. MoMoPay will launch like any native APK!
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* iOS Safari Instructions */}
          {isIOS && (
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍎</span>
                  <h4 className="text-xs font-bold text-slate-200">
                    iPhone & iPad (Safari)
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                  iOS Safari
                </span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (<Share2 className="w-3.5 h-3.5 inline text-indigo-400 mx-0.5" />).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-indigo-400 mx-0.5" />).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-amber-400">Add</strong> in the top-right corner.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* App Perks */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Offline Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant MoMo SMS Parse</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
