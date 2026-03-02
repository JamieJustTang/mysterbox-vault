import React from 'react';
import { useVault } from '../context/VaultContext';
import { useTranslation } from '../i18n';

interface ExitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onClose }) => {
    const { saveVault, saveVaultAs, lockVault, fileHandle, language } = useVault();
    const t = useTranslation(language);

    if (!isOpen) return null;

    const handleSaveAndExit = async () => {
        const success = await saveVault();
        if (success) {
            lockVault();
        }
    };

    const handleSaveAsAndExit = async () => {
        const success = await saveVaultAs();
        if (success) {
            lockVault();
        }
    };

    const handleDiscardAndExit = () => {
        lockVault();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 ring-1 ring-gray-200 dark:ring-gray-700 animate-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">warning</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t.save ?? 'Save changes?'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {fileHandle
                            ? 'This vault was opened from a local file. Do you want to overwrite it?'
                            : 'This is a new vault. Please save before exiting.'}
                    </p>
                </div>

                <div className="space-y-2">
                    {fileHandle && (
                        <button
                            onClick={handleSaveAndExit}
                            className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Save & Overwrite
                        </button>
                    )}
                    <button
                        onClick={handleSaveAsAndExit}
                        className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        {fileHandle ? 'Save Copy As...' : 'Save to File & Exit'}
                    </button>
                    <button
                        onClick={handleDiscardAndExit}
                        className="w-full py-2.5 px-4 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Discard Changes & Exit
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 px-4 rounded-xl text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all"
                    >
                        {t.cancel ?? 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
};
