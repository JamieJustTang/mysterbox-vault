
import React from 'react';
import { Button } from './Button';
import { Save, FileDown, LogOut } from 'lucide-react';
import { TranslationFn } from '../types';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: () => void;
  onSaveAsAndExit: () => void;
  onExitWithoutSave: () => void;
  hasFileHandle: boolean;
  vaultName: string;
  t: TranslationFn;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  isOpen, onClose, onSaveAndExit, onSaveAsAndExit, onExitWithoutSave, hasFileHandle, vaultName, t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-surface w-full max-w-md p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('saveChanges')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
          {t('exitMessage')} <strong>{vaultName}</strong>.<br/>
          {hasFileHandle 
            ? t('exitConfirmExisting')
            : t('exitConfirmNew')}
        </p>

        <div className="flex flex-col gap-3">
          {hasFileHandle && (
            <Button variant="primary" onClick={onSaveAndExit} className="w-full justify-center">
              <Save size={18} className="mr-2" />
              {t('saveOverwrite')}
            </Button>
          )}
          
          <Button variant={hasFileHandle ? "secondary" : "primary"} onClick={onSaveAsAndExit} className="w-full justify-center">
            <FileDown size={18} className="mr-2" />
            {hasFileHandle ? t('saveCopyExit') : t('saveFileExit')}
          </Button>

          <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1"></div>

          <Button variant="danger" onClick={onExitWithoutSave} className="w-full justify-center">
            <LogOut size={18} className="mr-2" />
            {t('discardExit')}
          </Button>
          
          <Button variant="ghost" onClick={onClose} className="w-full justify-center mt-1">
            {t('cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
};
