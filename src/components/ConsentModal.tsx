import React from 'react';
import { ShieldCheck, Lock, Copy, Image as ImageIcon, Database, X, Check } from 'lucide-react';
import { PendingConsentAction, PermissionKey, UserPermissions } from '../types/quotes';

interface ConsentModalProps {
  pendingAction: PendingConsentAction | null;
  onApprove: () => void;
  onCancel: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  pendingAction,
  onApprove,
  onCancel,
}) => {
  if (!pendingAction) return null;

  const getIcon = (key: PermissionKey) => {
    switch (key) {
      case 'localStorage':
        return <Database className="w-5 h-5 text-white" />;
      case 'clipboard':
        return <Copy className="w-5 h-5 text-white" />;
      case 'canvasExport':
        return <ImageIcon className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
    >
      <div className="max-w-md w-full bg-[#121212] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-neutral-800 flex items-center justify-center shrink-0">
              {getIcon(pendingAction.permission)}
            </div>
            <div>
              <p className="text-xs font-mono text-neutral-400">
                Browser Action Consent
              </p>
              <h3 id="consent-modal-title" className="text-lg font-serif font-semibold text-white">
                {pendingAction.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close permission dialog"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#E0E0E0] leading-relaxed mb-4">
          {pendingAction.description}
        </p>

        <div className="p-3.5 rounded-xl bg-black border border-neutral-800/90 mb-6">
          <div className="flex items-center gap-2 text-xs font-medium text-white mb-1">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Local-First Privacy Guarantee</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {pendingAction.technicalNote}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 min-h-[40px] rounded-lg border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="px-5 py-2.5 min-h-[40px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Allow & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface PermissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: UserPermissions;
  onTogglePermission: (key: PermissionKey) => void;
  onClearAllStorage: () => void;
}

export const PermissionsManagerModal: React.FC<PermissionsDrawerProps> = ({
  isOpen,
  onClose,
  permissions,
  onTogglePermission,
  onClearAllStorage,
}) => {
  if (!isOpen) return null;

  const items: {
    key: PermissionKey;
    label: string;
    desc: string;
  }[] = [
    {
      key: 'localStorage',
      label: 'Browser LocalStorage Vault',
      desc: 'Permits saving favorite quotes, custom collections, and morning reflection journal entries on your device.',
    },
    {
      key: 'clipboard',
      label: 'System Clipboard Copy',
      desc: 'Permits copying formatted quotes, attributions, and emoji signatures directly to your clipboard.',
    },
    {
      key: 'canvasExport',
      label: 'HTML5 Canvas Image Generation',
      desc: 'Permits rendering high-DPI quote cards in browser memory and downloading PNG files to your device.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-settings-title"
    >
      <div className="max-w-lg w-full bg-[#121212] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-white" />
            <h3 id="privacy-settings-title" className="text-lg font-serif font-semibold text-white">
              Privacy & Action Permissions
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close privacy settings"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item) => {
            const active = permissions[item.key];
            return (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-black border border-neutral-800/80"
              >
                <div>
                  <p className="text-sm font-medium text-white mb-1">{item.label}</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePermission(item.key)}
                  className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-700 hover:text-white'
                  }`}
                >
                  {active ? 'Granted' : 'Ask First'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClearAllStorage}
            className="px-3.5 py-2 min-h-[40px] text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Purge Local Vault Data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 min-h-[40px] bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
