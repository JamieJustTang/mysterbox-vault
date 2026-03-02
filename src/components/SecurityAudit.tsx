import React, { useState, useMemo } from 'react';
import { useVault } from '../context/VaultContext';
import { useTranslation } from '../i18n';
import { VaultCard } from '../types';
import { runAudit, getStrengthLabel, AuditItem, IssueType } from '../services/auditService';

interface SecurityAuditProps {
  onEditCard?: (card: VaultCard) => void;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export const SecurityAudit: React.FC<SecurityAuditProps> = ({ onEditCard }) => {
  const { vault, language } = useVault();
  const t = useTranslation(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<IssueType | 'all'>('all');

  // Issue display config — built from i18n keys
  const ISSUE_CONFIG: Record<IssueType, { label: string; color: string; bg: string; icon: string }> = {
    weak: { label: t.auditIssueWeak, color: 'text-red-500', bg: 'bg-red-50', icon: 'lock_open' },
    reused: { label: t.auditIssueReused, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'content_copy' },
    old: { label: t.auditIssueOld, color: 'text-blue-500', bg: 'bg-blue-50', icon: 'schedule' },
    incomplete: { label: t.auditIssueIncomplete, color: 'text-gray-500', bg: 'bg-gray-100', icon: 'warning' },
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return t.auditScoreExcellent;
    if (score >= 70) return t.auditScoreGood;
    if (score >= 50) return t.auditScoreFair;
    return t.auditScorePoor;
  };

  const audit = useMemo(() => runAudit(vault?.cards || []), [vault?.cards]);

  const filteredItems = useMemo(() => {
    let items = audit.allIssueItems;
    if (filterType !== 'all') items = items.filter(i => i.issues.includes(filterType));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.card.title.toLowerCase().includes(q) || (i.card.username || '').toLowerCase().includes(q));
    }
    return items;
  }, [audit.allIssueItems, filterType, searchQuery]);

  // SVG ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (audit.score / 100) * circumference;

  const getFavicon = (url?: string) => {
    if (!url) return null;
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; } catch { return null; }
  };

  return (
    <div className="flex-1 overflow-y-auto rounded-2xl bg-[#F6F7F9] border border-white/60 shadow-sm p-3 sm:p-5 scroll-smooth h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-3rem)] pb-24 lg:pb-5">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* ── Header: title + stats + score ring ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
          {/* Top: score ring (mobile: centered top; desktop: right side) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-1">{t.securityAudit}</h1>
              <p className="text-gray-400 text-xs font-medium mb-4">
                {t.auditDetecting} · {audit.totalCards} {t.auditSubtitle}
              </p>
              {/* MiniStats: 2-col on mobile, 4-col on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <MiniStat
                  icon="lock_open" color="text-red-500" bg="bg-red-50"
                  value={audit.weakPasswords.length} label={t.auditWeakPasswords}
                  active={filterType === 'weak'}
                  onClick={() => setFilterType(filterType === 'weak' ? 'all' : 'weak')}
                />
                <MiniStat
                  icon="content_copy" color="text-amber-600" bg="bg-amber-50"
                  value={audit.reusedGroups.length} label={t.auditReusedGroups}
                  active={filterType === 'reused'}
                  onClick={() => setFilterType(filterType === 'reused' ? 'all' : 'reused')}
                />
                <MiniStat
                  icon="schedule" color="text-blue-500" bg="bg-blue-50"
                  value={audit.oldPasswords.length} label={t.auditOldPasswords}
                  active={filterType === 'old'}
                  onClick={() => setFilterType(filterType === 'old' ? 'all' : 'old')}
                />
                <MiniStat
                  icon="warning" color="text-gray-500" bg="bg-gray-100"
                  value={audit.incompleteCards.length} label={t.auditIncomplete}
                  active={filterType === 'incomplete'}
                  onClick={() => setFilterType(filterType === 'incomplete' ? 'all' : 'incomplete')}
                />
              </div>
            </div>

            {/* Score ring */}
            <div className="flex flex-col items-center sm:ml-6 shrink-0">
              <div className="relative size-20 sm:size-24">
                <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-gray-100" cx="50" cy="50" fill="transparent" r={radius} stroke="currentColor" strokeWidth="8" />
                  <circle
                    className={`${getScoreColor(audit.score)} transition-all duration-1000 ease-out`}
                    cx="50" cy="50" fill="transparent" r={radius}
                    stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-gray-900">{audit.score}</span>
                </div>
              </div>
              <span className={`mt-1.5 text-[11px] font-bold ${getScoreColor(audit.score)}`}>
                {getScoreLabel(audit.score)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Vulnerable Items ── */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              {t.auditVulnItems}
              <span className="text-xs font-normal text-gray-400">
                {filteredItems.length}{t.auditNItems}
                {filterType !== 'all' && (
                  <>{t.auditFilterPrefix}{ISSUE_CONFIG[filterType].label}</>
                )}
              </span>
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-52">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[16px] pointer-events-none">search</span>
                <input
                  type="text"
                  placeholder={t.auditSearchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-lg text-xs font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-100 outline-none"
                />
              </div>
              {filterType !== 'all' && (
                <button
                  onClick={() => setFilterType('all')}
                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  {t.auditClearFilter}
                </button>
              )}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-50 mb-3">
                <span className="material-symbols-outlined text-2xl text-emerald-500">verified</span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-0.5">
                {audit.allIssueItems.length === 0 ? t.auditAllSafe : t.auditNoMatch}
              </h4>
              <p className="text-[11px] text-gray-400">
                {audit.allIssueItems.length === 0 ? t.auditAllSafeDesc : t.auditNoMatchDesc}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredItems.map((item, idx) => (
                <VulnerableRow
                  key={item.card.id}
                  item={item}
                  favicon={getFavicon(item.card.url)}
                  onFix={onEditCard ? () => onEditCard(item.card) : undefined}
                  isLast={idx === filteredItems.length - 1}
                  issueConfig={ISSUE_CONFIG}
                  fixLabel={t.auditFixBtn}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Mini Stat Chip ───────────────────────────────────────────────

interface MiniStatProps {
  icon: string; color: string; bg: string;
  value: number; label: string;
  active?: boolean; onClick?: () => void;
}

const MiniStat: React.FC<MiniStatProps> = ({ icon, color, bg, value, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${active ? 'ring-2 ring-primary ring-offset-1 bg-white shadow-sm' : 'bg-gray-50 hover:bg-white hover:shadow-sm'
      }`}
  >
    <div className={`size-7 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
      <span className="material-symbols-outlined text-[15px]">{icon}</span>
    </div>
    <div className="text-left">
      <span className="text-lg font-bold text-gray-900 leading-none">{value}</span>
      <p className="text-[10px] text-gray-400 font-medium leading-tight">{label}</p>
    </div>
  </button>
);

// ─── Vulnerable Item Row ──────────────────────────────────────────

interface VulnerableRowProps {
  item: AuditItem;
  favicon: string | null;
  onFix?: () => void;
  isLast?: boolean;
  issueConfig: Record<IssueType, { label: string; color: string; bg: string; icon: string }>;
  fixLabel: string;
}

const VulnerableRow: React.FC<VulnerableRowProps> = ({ item, favicon, onFix, isLast, issueConfig, fixLabel }) => {
  const { card } = item;
  const strength = getStrengthLabel(item.passwordScore);

  return (
    <div className={`flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-xl transition-colors group ${!isLast ? 'border-b border-gray-50' : ''}`}>
      {/* Avatar + info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="size-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {favicon ? (
            <img src={favicon} alt="" className="size-4 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span className="font-bold text-gray-400 text-[10px]">{card.title.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 text-xs truncate leading-tight">{card.title}</h4>
          <p className="text-gray-400 text-[10px] truncate leading-tight">{card.username || '—'}</p>
        </div>
      </div>

      {/* Issue badges */}
      <div className="hidden md:flex items-center gap-1 flex-1 justify-start ml-3">
        {item.issues.map(issue => {
          const cfg = issueConfig[issue];
          return (
            <span key={issue} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
              <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
              {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Strength bar */}
      <div className="hidden sm:flex items-center gap-1.5 w-20 justify-end">
        <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${strength.level === 'strong' ? 'bg-emerald-500' :
              strength.level === 'medium' ? 'bg-amber-400' :
                strength.level === 'weak' ? 'bg-orange-400' : 'bg-red-500'
              }`}
            style={{ width: `${item.passwordScore}%` }}
          />
        </div>
        <span className={`text-[10px] font-bold w-5 text-right ${strength.level === 'strong' ? 'text-emerald-500' :
          strength.level === 'medium' ? 'text-amber-500' :
            strength.level === 'weak' ? 'text-orange-500' : 'text-red-500'
          }`}>
          {item.passwordScore}
        </span>
      </div>

      {/* Fix button */}
      {onFix && (
        <button
          onClick={onFix}
          className="ml-2 px-2.5 py-1 rounded-lg border border-primary/20 text-primary font-semibold text-[10px] hover:bg-red-50 transition-colors shrink-0 flex items-center gap-0.5"
        >
          <span className="material-symbols-outlined text-[13px]">edit</span>
          {fixLabel}
        </button>
      )}
    </div>
  );
};
