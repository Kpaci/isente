import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getDirectDownloadUrl, isGoogleDriveUrl } from '../lib/driveUtils';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { ApkReleaseConfig } from '../types/finance';
import { 
  Smartphone, 
  X, 
  Download, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Cpu,
  CheckCircle2,
  Settings,
  Save,
  AlertCircle,
  Loader2,
  ChevronDown,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface AndroidAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_EMAIL = 'pacifique.k01@gmail.com';

const FALLBACK_RELEASE: ApkReleaseConfig = {
  downloadUrl: '',
  version: 'v1.0.0',
  releaseNotes: 'Native Android build with automatic MTN MoMo SMS reading and 100% offline local storage.',
  updatedAt: new Date().toISOString()
};

export const AndroidAPKModal: React.FC<AndroidAPKModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { user } = useFinance();
  const isAdmin = Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  const [release, setRelease] = useState<ApkReleaseConfig>(FALLBACK_RELEASE);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Admin form state
  const [inputUrl, setInputUrl] = useState('');
  const [inputVersion, setInputVersion] = useState('');
  const [inputNotes, setInputNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  useEscapeKey(onClose, isOpen);

  // Subscribe to real-time APK release configuration in Firestore
  useEffect(() => {
    if (!isOpen) return;

    const configDocRef = doc(db, 'app_config', 'apk_release');
    const unsubscribe = onSnapshot(
      configDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as ApkReleaseConfig;
          setRelease(data);
          setInputUrl(data.downloadUrl || '');
          setInputVersion(data.version || 'v1.0.0');
          setInputNotes(data.releaseNotes || '');
        } else {
          // If no doc exists yet, check localStorage or use fallback
          const cached = localStorage.getItem('momo_apk_release');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setRelease(parsed);
              setInputUrl(parsed.downloadUrl || '');
              setInputVersion(parsed.version || 'v1.0.0');
              setInputNotes(parsed.releaseNotes || '');
            } catch {
              // Ignore parse error
            }
          }
        }
        setLoadingConfig(false);
      },
      (error) => {
        console.warn('Could not read /app_config/apk_release from Firestore; using local cache:', error);
        const cached = localStorage.getItem('momo_apk_release');
        if (cached) {
          try {
            setRelease(JSON.parse(cached));
          } catch {
            // Ignore
          }
        }
        setLoadingConfig(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const directDownloadUrl = release.downloadUrl ? getDirectDownloadUrl(release.downloadUrl) : '';
  const isDrive = Boolean(release.downloadUrl && isGoogleDriveUrl(release.downloadUrl));

  const handleDownload = () => {
    if (!directDownloadUrl) {
      if (isAdmin) {
        setIsAdminPanelOpen(true);
        setSaveStatus({
          type: 'error',
          message: 'Please paste your Google Drive APK link in the admin section below first.'
        });
      } else {
        alert('The latest APK download link is being updated by the administrator. Please check back shortly.');
      }
      return;
    }

    setDownloadTriggered(true);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = directDownloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', `Isente-${release.version || 'app'}.apk`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadTriggered(false);
    }, 6000);
  };

  const handleSaveRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const trimmedUrl = inputUrl.trim();
    if (!trimmedUrl) {
      setSaveStatus({ type: 'error', message: 'Please enter a valid Google Drive or APK URL.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    const updatedConfig: ApkReleaseConfig = {
      downloadUrl: trimmedUrl,
      version: inputVersion.trim() || 'v1.0.0',
      releaseNotes: inputNotes.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || ADMIN_EMAIL
    };

    try {
      const configDocRef = doc(db, 'app_config', 'apk_release');
      await setDoc(configDocRef, updatedConfig);
      
      localStorage.setItem('momo_apk_release', JSON.stringify(updatedConfig));
      setRelease(updatedConfig);
      setSaveStatus({ type: 'success', message: 'New APK download link successfully published for all users!' });
      setTimeout(() => {
        setSaveStatus(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to save APK release configuration:', err);
      // Cache locally so admin still has it saved
      localStorage.setItem('momo_apk_release', JSON.stringify(updatedConfig));
      setRelease(updatedConfig);
      setSaveStatus({ 
        type: 'error', 
        message: 'Saved locally, but Firestore write failed. Make sure your account is pacifique.k01@gmail.com' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#05F292] to-[#6366F1] text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base leading-snug">
                  Isente Android App
                </h3>
                <span className="text-[11px] font-bold text-[#05F292] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {release.version || 'v1.0.0'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Install directly on your phone with zero app store fees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* Value Highlights Strip - Clean Unboxed Layout */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-center">
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Auto MoMo SMS</p>
              <p className="text-[10px] text-slate-400">No manual copying</p>
            </div>
            <div className="space-y-1 border-x border-slate-800/80">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">100% Offline</p>
              <p className="text-[10px] text-slate-400">Works without data</p>
            </div>
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
                <Cpu className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Direct APK</p>
              <p className="text-[10px] text-slate-400">One-tap install</p>
            </div>
          </div>

          {/* Primary Action Zone: Large Download APK Button */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">Package:</span>
                <span>MoMoPay Android (.apk)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Updated:</span>
                <span className="font-mono text-slate-300">
                  {release.updatedAt ? new Date(release.updatedAt).toLocaleDateString() : 'Latest'}
                </span>
              </div>
            </div>

            {release.releaseNotes && (
              <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                {release.releaseNotes}
              </p>
            )}

            {/* Big Prominent Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={loadingConfig}
              className="w-full min-h-[52px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#05F292] via-emerald-400 to-teal-400 hover:opacity-95 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.8]" />
              <span>Download Isente APK ({release.version || 'Latest'})</span>
              <ExternalLink className="w-4 h-4 opacity-75" />
            </button>

            {downloadTriggered && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Download started! Tap the file in your notification bar when finished.</span>
              </div>
            )}
          </div>

          {/* Sideload Installation 3-Step Guide */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>How to Install on Android in 3 Steps</span>
            </div>
            <ol className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>Tap <strong className="text-white">Download APK</strong> above to save the installer file.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>Open your notification drawer or Downloads folder and tap the downloaded <strong className="text-white">.apk</strong> file.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>Tap <strong className="text-amber-400">Install</strong>. (If Android prompts, toggle <em>Allow from this source</em>).</span>
              </li>
            </ol>
          </div>

          {/* Admin Configuration Drawer - Strictly visible ONLY for pacifique.k01@gmail.com */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-[#05F292]/30 space-y-3">
              <div 
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-[#05F292] flex items-center justify-center">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Admin: APK Cloud Build &amp; Link</span>
                      <span className="text-[9px] bg-emerald-500/20 text-[#05F292] px-1.5 py-0.2 rounded font-mono">CI/CD Ready</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Manage release for all users ({ADMIN_EMAIL})</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#05F292]">
                  <span className="text-[11px] font-semibold">{isAdminPanelOpen ? 'Collapse' : 'Configure'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isAdminPanelOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isAdminPanelOpen && (
                <div className="space-y-4 pt-3 border-t border-slate-800/80">
                  
                  {/* Step-by-Step CI/CD Guidance */}
                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 text-[11px] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#05F292]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>How to Build APK via GitHub Actions (Free Cloud Build):</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
                      <li>Go to your GitHub repo &rarr; click the <strong className="text-white">Actions</strong> tab.</li>
                      <li>Select <strong className="text-white">Build Isente Android APK</strong> &rarr; click <strong className="text-emerald-400">Run workflow</strong>.</li>
                      <li>Once complete (~2 mins), download the <strong className="text-white">Isente-Android-APK</strong> artifact.</li>
                      <li>Upload the <code className="text-emerald-300 bg-slate-900 px-1 rounded">Isente-v1.0.0.apk</code> to your Google Drive.</li>
                      <li>In Drive: click <strong className="text-white">Share</strong> &rarr; change to <strong className="text-emerald-400">&quot;Anyone with the link can view&quot;</strong>.</li>
                      <li>Paste the link below and click <strong className="text-white">Publish New APK Link</strong>.</li>
                    </ol>

                    {/* Local CLI Command alternative */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">Local terminal command:</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText('npm run apk:build');
                          setCopiedCommand(true);
                          setTimeout(() => setCopiedCommand(false), 2500);
                        }}
                        className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      >
                        {copiedCommand ? (
                          <>
                            <Check className="w-3 h-3 text-[#05F292]" />
                            <span className="text-[#05F292] font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span className="font-mono">npm run apk:build</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Link Update Form */}
                  <form onSubmit={handleSaveRelease} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Google Drive Link or Direct APK URL
                      </label>
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                        required
                        className="w-full px-3 py-2 text-xs bg-[#080c14] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#05F292] transition-colors"
                      />
                      {inputUrl && isGoogleDriveUrl(inputUrl) && (
                        <p className="text-[10px] text-[#05F292] mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Google Drive link detected. Converts automatically to direct 1-tap download endpoint.</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Version Tag
                        </label>
                        <input
                          type="text"
                          value={inputVersion}
                          onChange={(e) => setInputVersion(e.target.value)}
                          placeholder="v1.0.0"
                          required
                          className="w-full px-3 py-2 text-xs bg-[#080c14] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#05F292] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Short Release Note
                        </label>
                        <input
                          type="text"
                          value={inputNotes}
                          onChange={(e) => setInputNotes(e.target.value)}
                          placeholder="Native Android build with auto SMS"
                          className="w-full px-3 py-2 text-xs bg-[#080c14] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#05F292] transition-colors"
                        />
                      </div>
                    </div>

                    {saveStatus && (
                      <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        saveStatus.type === 'success' 
                          ? 'bg-emerald-500/10 text-[#05F292] border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {saveStatus.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{saveStatus.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#05F292] to-emerald-400 hover:from-emerald-400 hover:to-[#05F292] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing Release Link...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Publish New APK Link for All Users</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
