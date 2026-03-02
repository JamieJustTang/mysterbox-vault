/**
 * Security Audit Service for MysterBox
 *
 * Pure functions: takes VaultCard[] → returns AuditResult.
 * All analysis is local, zero network requests.
 *
 * Weak password dictionary sourced from:
 *   danielmiessler/SecLists — 10k-most-common.txt (top 500 selected)
 *   License: MIT — https://github.com/danielmiessler/SecLists
 */

import { VaultCard } from '../types';

// ─── Types ────────────────────────────────────────────────────────

export type IssueType = 'weak' | 'reused' | 'incomplete' | 'old';

export interface AuditItem {
    card: VaultCard;
    issues: IssueType[];
    passwordScore: number;   // 0-100
    passwordAge?: number;    // days since last update
    reusedWith?: string[];   // IDs of cards sharing the same password
}

export interface AuditResult {
    score: number;                   // overall 0-100
    totalCards: number;
    weakPasswords: AuditItem[];
    reusedGroups: AuditItem[][];     // each group = cards sharing same pw
    oldPasswords: AuditItem[];       // >180 days since updatedAt
    incompleteCards: AuditItem[];    // missing URL or username
    allIssueItems: AuditItem[];     // deduplicated union of all issues
}

// ─── Weak Password Dictionary (SecLists top-500) ──────────────────

const WEAK_PASSWORDS = new Set([
    'password', '123456', '12345678', '1234', 'qwerty', '12345', 'dragon', 'pussy',
    'baseball', 'football', 'letmein', 'monkey', '696969', 'abc123', 'mustang',
    'michael', 'shadow', 'master', 'jennifer', '111111', '2000', 'jordan', 'superman',
    'harley', '1234567', 'fuckme', 'hunter', 'fuckyou', 'trustno1', 'ranger', 'buster',
    'thomas', 'tigger', 'robert', 'soccer', 'fuck', 'batman', 'test', 'pass', 'killer',
    'hockey', 'george', 'charlie', 'andrew', 'michelle', 'love', 'sunshine', 'jessica',
    'asshole', '6969', 'pepper', 'daniel', 'access', '123456789', '654321', 'joshua',
    'maggie', 'starwars', 'silver', 'william', 'dallas', 'yankees', '123123', 'ashley',
    '666666', 'hello', 'amanda', 'orange', 'biteme', 'freedom', 'computer', 'sexy',
    'thunder', 'nicole', 'ginger', 'heather', 'hammer', 'summer', 'corvette', 'taylor',
    'fucker', 'austin', '1111', 'merlin', 'matthew', '121212', 'golfer', 'cheese',
    'princess', 'martin', 'chelsea', 'patrick', 'richard', 'diamond', 'yellow', 'bigdog',
    'secret', 'asdfgh', 'sparky', 'cowboy', 'camaro', 'anthony', 'matrix', 'falcon',
    'iloveyou', 'bailey', 'guitar', 'jackson', 'purple', 'scooter', 'phoenix', 'aaaaaa',
    'morgan', 'tigers', 'porsche', 'mickey', 'maverick', 'cookie', 'nascar', 'peanut',
    'justin', '131313', 'money', 'horny', 'samantha', 'panties', 'steelers', 'joseph',
    'snoopy', 'boomer', 'whatever', 'iceman', 'smokey', 'gateway', 'dakota', 'cowboys',
    'eagles', 'chicken', 'dick', 'black', 'zxcvbn', 'please', 'andrea', 'ferrari',
    'knight', 'hardcore', 'melissa', 'compaq', 'coffee', 'booboo', 'bitch', 'johnny',
    'bulldog', 'xxxxxx', 'welcome', 'james', 'player', 'ncc1701', 'wizard', 'scooby',
    'charles', 'junior', 'internet', 'bigdick', 'mike', 'brandy', 'tennis', 'blowjob',
    'banana', 'monster', 'spider', 'lakers', 'miller', 'rabbit', 'enter', 'mercedes',
    'brandon', 'steven', 'fender', 'john', 'yamaha', 'diablo', 'chris', 'boston',
    'tiger', 'marine', 'chicago', 'rangers', 'gandalf', 'winter', 'bigtits', 'barney',
    'edward', 'raiders', 'porn', 'badboy', 'blowme', 'spanky', 'bigdaddy', 'johnson',
    'chester', 'london', 'midnight', 'blue', 'fishing', '000000', 'hannah', 'slayer',
    '11111111', 'rachel', 'sexsex', 'redsox', 'thx1138', 'asdf', 'marlboro', 'panther',
    'zxcvbnm', 'arsenal', 'oliver', 'qazwsx', 'mother', 'victoria', '7777777', 'jasper',
    'angel', 'david', 'winner', 'crystal', 'golden', 'butthead', 'viking', 'jack',
    'iwantu', 'shannon', 'murphy', 'angels', 'prince', 'cameron', 'girls', 'madison',
    'wilson', 'carlos', 'hooters', 'willie', 'startrek', 'captain', 'maddog', 'jasmine',
    'butter', 'booger', 'angela', 'golf', 'lauren', 'rocket', 'tiffany', 'theman',
    'dennis', 'liverpoo', 'flower', 'forever', 'green', 'jackie', 'muffin', 'turtle',
    'sophie', 'danielle', 'redskins', 'toyota', 'jason', 'sierra', 'winston', 'debbie',
    'giants', 'packers', 'newyork', 'jeremy', 'casper', 'bubba', '112233', 'sandra',
    'lovers', 'mountain', 'united', 'cooper', 'driver', 'tucker', 'helpme', 'fucking',
    'pookie', 'lucky', 'maxwell', '8675309', 'bear', 'suckit', 'gators', '5150',
    '222222', 'shithead', 'fuckoff', 'jaguar', 'monica', 'fred', 'happy', 'hotdog',
    'tits', 'gemini', 'lover', 'xxxxxxxx', '777777', 'canada', 'nathan', 'victor',
    'florida', '88888888', 'nicholas', 'rosebud', 'metallic', 'doctor', 'trouble',
    'success', 'stupid', 'tomcat', 'warrior', 'peaches', 'apples', 'fish', 'qwertyui',
    'magic', 'buddy', 'dolphins', 'rainbow', 'gunner', '987654', 'freddy', 'alexis',
    'braves', 'cock', '2112', '1212', 'cocacola', 'xavier', 'dolphin', 'testing',
    'bond007', 'member', 'calvin', 'voodoo', '7777', 'samson', 'alex', 'apollo',
    'fire', 'tester', 'walter', 'beavis', 'voyager', 'peter', 'porno', 'bonnie',
    'rush2112', 'beer', 'apple', 'scorpio', 'jonathan', 'skippy', 'sydney', 'scott',
    'red123', 'power', 'gordon', 'travis', 'beaver', 'star', 'jackass', 'flyers',
    'boobs', '232323', 'zzzzzz', 'steve', 'rebecca', 'scorpion', 'doggie', 'legend',
    'ou812', 'yankee', 'blazer', 'bill', 'runner', 'birdie', 'bitches', '555555',
    'parker', 'topgun', 'asdfasdf', 'heaven', 'viper', 'animal', '2222', 'bigboy',
    '4444', 'arthur', 'baby', 'private', 'godzilla', 'donald', 'williams', 'lifehack',
    'phantom', 'dave', 'rock', 'august', 'sammy', 'cool', 'brian', 'platinum', 'jake',
    'bronco', 'paul', 'mark', 'frank', 'heka6w2', 'copper', 'billy', 'cumshot',
    'garfield', 'willow', 'cunt', 'little', 'carter', 'slut', 'albert', '69696969',
    'kitten', 'super', 'jordan23', 'eagle1', 'shelby', 'america', '11111', 'jessie',
    'house', 'free', '123321', 'chevy', 'bullshit', 'white', 'broncos', 'horney',
    'surfer', 'nissan', '999999', 'saturn', 'airborne', 'elephant', 'marvin', 'shit',
    'action', 'adidas', 'qwert', 'kevin', '1313', 'explorer', 'walker', 'police',
    'december', 'benjamin', 'wolf', 'sweet', 'therock', 'king', 'online', 'dickhead',
    'brooklyn', 'teresa', 'cricket', 'sharon', 'dexter', 'racing', 'penis', 'gregory',
    '0000', 'teens', 'redwings', 'dreams', 'michigan', 'hentai', 'magnum', '87654321',
    'nothing', 'donkey', 'trinity', 'digital', '333333', 'stella', 'cartman', 'guinness',
    '123abc', 'speedy', 'buffalo', 'kitty', 'pimpin', 'eagle', 'einstein', 'kelly',
    'nelson', 'nirvana', 'vampire', 'xxxx', 'playboy', 'louise', 'pumpkin', 'snowball',
    'test123', 'girl', 'sucker', 'mexico', 'beatles', 'fantasy', 'ford', 'gibson',
    'celtic', 'marcus', 'cherry', 'cassie', '888888', 'natasha', 'sniper', 'chance',
    'genesis', 'hotrod', 'reddog', 'college', 'jester', 'passw0rd', 'bigcock', 'smith',
    'lasvegas', 'carmen', 'slipknot', '3333', 'death', 'kimberly', '1q2w3e', 'eclipse',
    '1q2w3e4r', 'stanley', 'samuel', 'drummer', 'homer', 'montana', 'music', 'aaaa',
    'password1', 'password123', 'admin', 'admin123', 'root', 'login', 'welcome1',
    'qwerty123', 'letmein1', 'master123', 'abc1234', 'iloveyou1', 'p@ssw0rd',
    'changeme', 'default', 'guest', 'temp', 'test1234', 'user', 'access1',
]);

// ─── Password Strength Scoring ───────────────────────────────────

export function scorePassword(password: string, card?: VaultCard): number {
    if (!password) return 0;

    const lower = password.toLowerCase();

    // Instant fail: in weak dictionary
    if (WEAK_PASSWORDS.has(lower)) return Math.min(15, password.length * 2);

    let score = 0;

    // Length contribution (max 35)
    if (password.length >= 16) score += 35;
    else if (password.length >= 12) score += 28;
    else if (password.length >= 10) score += 22;
    else if (password.length >= 8) score += 15;
    else score += password.length * 2;

    // Character diversity (max 40)
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const charTypes = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
    score += charTypes * 10;

    // Uniqueness bonus (max 15)
    const uniqueChars = new Set(password).size;
    const uniqueRatio = uniqueChars / password.length;
    score += Math.round(uniqueRatio * 15);

    // Penalties
    // Sequential chars: abc, 123, etc.
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
        score -= 10;
    }
    // Repeated chars: aaa, 111
    if (/(.)\1{2,}/.test(password)) score -= 10;

    // Contains username or title → penalty
    if (card) {
        if (card.username && password.toLowerCase().includes(card.username.toLowerCase())) score -= 15;
        if (card.title && password.toLowerCase().includes(card.title.toLowerCase())) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
}

export function getStrengthLabel(score: number): { label: string; level: 'critical' | 'weak' | 'medium' | 'strong' } {
    if (score <= 25) return { label: '极弱', level: 'critical' };
    if (score <= 50) return { label: '弱', level: 'weak' };
    if (score <= 75) return { label: '中等', level: 'medium' };
    return { label: '强', level: 'strong' };
}

// ─── Reuse Detection ─────────────────────────────────────────────

function findReusedGroups(cards: VaultCard[]): Map<string, VaultCard[]> {
    const pwMap = new Map<string, VaultCard[]>();

    for (const card of cards) {
        if (!card.password || card.archived) continue;
        const pw = card.password; // Compare exact passwords
        const existing = pwMap.get(pw);
        if (existing) {
            existing.push(card);
        } else {
            pwMap.set(pw, [card]);
        }
    }

    // Keep only groups with 2+ cards
    const groups = new Map<string, VaultCard[]>();
    for (const [pw, cards] of pwMap) {
        if (cards.length >= 2) groups.set(pw, cards);
    }
    return groups;
}

// ─── Password Age ────────────────────────────────────────────────

const DAY_MS = 86400000;
const OLD_PASSWORD_DAYS = 180;

function getPasswordAge(card: VaultCard): number {
    const lastUpdate = card.updatedAt || card.createdAt;
    return Math.floor((Date.now() - lastUpdate) / DAY_MS);
}

// ─── Main Audit Function ─────────────────────────────────────────

export function runAudit(cards: VaultCard[]): AuditResult {
    const activeCards = cards.filter(c => !c.archived);
    const totalCards = activeCards.length;

    if (totalCards === 0) {
        return {
            score: 100,
            totalCards: 0,
            weakPasswords: [],
            reusedGroups: [],
            oldPasswords: [],
            incompleteCards: [],
            allIssueItems: [],
        };
    }

    // ── Step 1: Score each card ──
    const itemMap = new Map<string, AuditItem>();
    const getOrCreate = (card: VaultCard): AuditItem => {
        let item = itemMap.get(card.id);
        if (!item) {
            item = {
                card,
                issues: [],
                passwordScore: scorePassword(card.password || '', card),
                passwordAge: getPasswordAge(card),
            };
            itemMap.set(card.id, item);
        }
        return item;
    };

    // Score all cards
    for (const card of activeCards) {
        getOrCreate(card);
    }

    // ── Step 2: Weak passwords ──
    const weakPasswords: AuditItem[] = [];
    for (const item of itemMap.values()) {
        if (item.card.password && item.passwordScore <= 50) {
            item.issues.push('weak');
            weakPasswords.push(item);
        }
    }

    // ── Step 3: Reused passwords ──
    const reusedMap = findReusedGroups(activeCards);
    const reusedGroups: AuditItem[][] = [];
    for (const [, groupCards] of reusedMap) {
        const groupItems: AuditItem[] = [];
        const ids = groupCards.map(c => c.id);
        for (const card of groupCards) {
            const item = getOrCreate(card);
            item.issues.push('reused');
            item.reusedWith = ids.filter(id => id !== card.id);
            groupItems.push(item);
        }
        reusedGroups.push(groupItems);
    }

    // ── Step 4: Password age ──
    const oldPasswords: AuditItem[] = [];
    for (const item of itemMap.values()) {
        if (item.passwordAge !== undefined && item.passwordAge > OLD_PASSWORD_DAYS) {
            item.issues.push('old');
            oldPasswords.push(item);
        }
    }

    // ── Step 5: Incomplete cards ──
    const incompleteCards: AuditItem[] = [];
    for (const item of itemMap.values()) {
        const c = item.card;
        if (!c.password || !c.username || !c.url) {
            item.issues.push('incomplete');
            incompleteCards.push(item);
        }
    }

    // ── Step 6: Compute overall score ──
    const allIssueItems = Array.from(itemMap.values()).filter(i => i.issues.length > 0);

    // Average password strength (0-100)
    const cardsWithPw = activeCards.filter(c => c.password);
    const avgStrength = cardsWithPw.length > 0
        ? Array.from(itemMap.values())
            .filter(i => i.card.password)
            .reduce((sum, i) => sum + i.passwordScore, 0) / cardsWithPw.length
        : 100;

    // Reuse penalty
    const reusedCount = new Set(reusedGroups.flat().map(i => i.card.id)).size;
    const reuseRatio = cardsWithPw.length > 0 ? reusedCount / cardsWithPw.length : 0;

    // Completeness ratio
    const completeCount = activeCards.filter(c => c.password && c.username).length;
    const completeness = totalCards > 0 ? completeCount / totalCards : 1;

    const score = Math.round(
        avgStrength * 0.5 +
        (1 - reuseRatio) * 100 * 0.3 +
        completeness * 100 * 0.2
    );

    return {
        score: Math.max(0, Math.min(100, score)),
        totalCards,
        weakPasswords,
        reusedGroups,
        oldPasswords,
        incompleteCards,
        allIssueItems,
    };
}
