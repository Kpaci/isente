import { ExpenseCategory, ParsedMoMoSMS } from '../types/finance';

/**
 * Keyword-based category classification dictionary
 */
const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  food: [
    'restaurant', 'cafe', 'bistro', 'food', 'bakery', 'coffee', 'pizza', 'burger', 
    'bourbon', 'soleil', 'inzozi', 'kfc', 'chicken', 'diner', 'grill', 'snack', 'bar'
  ],
  groceries: [
    'supermarket', 'market', 'simba', 'sawa', 'ndoli', 'frulep', 'grocer', 
    'kimironko', 'nyarugenge', 'fresh', 'butcher', 'vegetable', 'fruit', 'minimart'
  ],
  transportation: [
    'fuel', 'petrol', 'station', 'total', 'sp', 'engen', 'rubis', 'oil', 
    'taxi', 'yego', 'move', 'vw', 'volcano', 'horizon', 'kbs', 'bus', 'ritco', 'moto', 'transport'
  ],
  healthcare: [
    'pharmacy', 'pharmacie', 'clinic', 'hospital', 'medical', 'health', 'dispensary', 
    'doctor', 'dentist', 'medecin', 'chuk', 'king faisal', 'la croix', 'optician'
  ],
  utilities: [
    'eucl', 'reg', 'wasac', 'electricity', 'cashpower', 'water', 'internet', 
    'canal+', 'canal', 'startimes', 'dstv', 'mtn data', 'airtel data', 'liquid', 'ispa'
  ],
  rent: [
    'rent', 'landlord', 'housing', 'apartment', 'estate', 'property', 'ubukode', 'inzu'
  ],
  entertainment: [
    'cinema', 'century', 'movie', 'ticket', 'concert', 'club', 'lounge', 
    'hotel', 'resort', 'netflix', 'spotify', 'games', 'play'
  ],
  shopping: [
    'boutique', 'chic', 'mall', 'clothing', 'store', 'electronics', 'phone', 
    'fashion', 'shoes', 'hardware', 'quincaillerie', 'stationery'
  ],
  other: []
};

/**
 * Guess the most appropriate expense category from vendor name and text
 */
export function inferCategory(vendorName: string, text: string): ExpenseCategory {
  const normalized = (vendorName + ' ' + text).toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ExpenseCategory, string[]][]) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        return category;
      }
    }
  }

  return 'other';
}

/**
 * Parses MTN Rwanda and Airtel Money SMS notifications
 */
export function parseMoMoSMS(rawText: string): ParsedMoMoSMS {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Detect provider
  let provider: 'mtn' | 'airtel' | 'generic' = 'generic';
  if (lower.includes('financial transaction id') || lower.includes('nimero y\'ihererekanya') || lower.includes('y\'ihererekanya') || text.includes('*182*')) {
    provider = 'mtn';
  } else if (lower.includes('txn id: mp') || lower.includes('airtel') || lower.includes('trans id: at')) {
    provider = 'airtel';
  } else if (lower.includes('rwf') || lower.includes('momo')) {
    provider = 'mtn';
  }

  // Detect Income vs Expense
  const isIncome = 
    lower.includes('you have received') || 
    lower.includes('mwakiriye') || 
    lower.includes('wakiriye') || 
    lower.includes('has sent you') ||
    lower.includes('deposited');

  // Extract amount
  // Matches "Payment of 12,500 RWF", "Kwishyura 5,000 RWF", "RWF 4,500", "sent 25,000 RWF"
  let amount = 0;
  const currency = 'RWF';

  const amountRegexes = [
    /(?:payment\s+of|kwishyura|sent|transferred|paid|received|mwakiriye)\s+(?:rwf\s*)?([0-9,]+(?:\.[0-9]+)?)/i,
    /(?:rwf)\s*([0-9,]+(?:\.[0-9]+)?)/i,
    /([0-9,]+(?:\.[0-9]+)?)\s*rwf/i,
  ];

  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const cleanNum = match[1].replace(/,/g, '');
      const parsed = parseFloat(cleanNum);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // Extract Vendor / Counterparty and Vendor/Payee Code
  let vendor = 'Mobile Money Merchant';
  let vendorCode: string | undefined = undefined;
  
  // MTN & Generic: "Payment of X to [Vendor Name] [Code] was completed at" or "kuri [Vendor] [Code] byarangiye"
  const mtnVendorMatch = text.match(/(?:to|kuri|from|kwa)\s+([A-Za-z0-9\s&()'+.-]+?)(?:\s+(?:was\s+)?completed|\s+was|\s+byarangiye|\s+at\s+\d{4}-\d{2}-\d{2}|\s+balance:|\s+fee|\s*[.;*#])/i);
  if (mtnVendorMatch && mtnVendorMatch[1]) {
    let raw = mtnVendorMatch[1].trim();

    // 1. Remove trailing auxiliary/status words like "was completed", "was", "completed", "is", "byarangiye", "at"
    while (/\s+(?:was\s+completed|completed|was|is|byarangiye|ku\s+wa|at)$/i.test(raw)) {
      raw = raw.replace(/\s+(?:was\s+completed|completed|was|is|byarangiye|ku\s+wa|at)$/i, '').trim();
    }

    // 2. Check for code or phone number in parentheses e.g. "NAME (514386)" or "NAME (0788123456)"
    const parenCodeMatch = raw.match(/\((07\d{8}|\+?250\d{9}|\d{3,12})\)/);
    if (parenCodeMatch) {
      vendorCode = parenCodeMatch[1];
      raw = raw.replace(parenCodeMatch[0], '').trim();
    } else {
      // 3. Check for trailing numeric merchant / payee code or phone number e.g. "TWIZWYIMANA EMMANUEL 514386"
      const trailingNumberMatch = raw.match(/\s+([0-9]{3,12})$/);
      if (trailingNumberMatch) {
        vendorCode = trailingNumberMatch[1];
        raw = raw.substring(0, trailingNumberMatch.index).trim();
      } else {
        // 4. Check for leading numeric code e.g. "514386 TWIZWYIMANA EMMANUEL"
        const leadingNumberMatch = raw.match(/^([0-9]{3,12})\s+(.+)$/);
        if (leadingNumberMatch) {
          vendorCode = leadingNumberMatch[1];
          raw = leadingNumberMatch[2].trim();
        }
      }
    }

    // 5. Completely purge the word "was", "is", and excess whitespace / edge punctuation from vendor
    raw = raw
      .replace(/\bwas\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^[-:.*#|]+|[-:.*#|]+$/g, '')
      .trim();

    if (raw.length > 1 && !raw.toLowerCase().includes('rwf')) {
      vendor = raw;
    } else if (vendorCode) {
      vendor = `Merchant ${vendorCode}`;
    }
  } else {
    // Pattern 2: Airtel "paid RWF X to [Vendor] [Code]"
    const airtelVendorMatch = text.match(/(?:paid|transferred)\s+(?:rwf\s*)?[0-9,.]+\s+to\s+([A-Za-z0-9\s&()'+.-]+?)(?:\s+(?:was\s+)?completed|\s+was|\s*[.;*#]|\s+fee)/i);
    if (airtelVendorMatch && airtelVendorMatch[1]) {
      let raw = airtelVendorMatch[1].trim();
      while (/\s+(?:was\s+completed|completed|was|is)$/i.test(raw)) {
        raw = raw.replace(/\s+(?:was\s+completed|completed|was|is)$/i, '').trim();
      }
      const codeMatch = raw.match(/\s+([0-9]{3,12})$/);
      if (codeMatch) {
        vendorCode = codeMatch[1];
        raw = raw.substring(0, codeMatch.index).trim();
      }
      raw = raw.replace(/\bwas\b/gi, '').replace(/\s{2,}/g, ' ').trim();
      if (raw.length > 0) {
        vendor = raw;
      } else if (vendorCode) {
        vendor = `Merchant ${vendorCode}`;
      }
    }
  }

  // Extract Reference ID
  let referenceId = '';
  const refMatch = text.match(/(?:Financial Transaction Id|Nimero y'ihererekanya|Transaction Id|Txn Id|Trans ID|TxId):\s*([A-Za-z0-9.]+)/i);
  if (refMatch && refMatch[1]) {
    referenceId = refMatch[1].trim();
  } else {
    // Fallback: look for 8-12 digits sequence
    const fallbackRef = text.match(/\b\d{8,12}\b/);
    if (fallbackRef) referenceId = fallbackRef[0];
  }

  // Extract Fee
  let fee = 0;
  const feeMatch = text.match(/(?:fee(?:\s+was)?|amafaranga yakatishijwe):\s*(?:rwf\s*)?([0-9,]+)/i);
  if (feeMatch && feeMatch[1]) {
    fee = parseFloat(feeMatch[1].replace(/,/g, '')) || 0;
  }

  // Extract New Balance
  let newBalance: number | undefined;
  const balanceMatch = text.match(/(?:new balance|asigaye|balance):\s*(?:rwf\s*)?([0-9,]+)/i);
  if (balanceMatch && balanceMatch[1]) {
    newBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
  }

  // Extract Date or use current timestamp
  let date = new Date().toISOString();
  const dateMatch = text.match(/\b(202\d-[0-1]\d-[0-3]\d(?:\s+[0-2]\d:[0-5]\d(?::[0-5]\d)?)?)\b/);
  if (dateMatch && dateMatch[1]) {
    const d = new Date(dateMatch[1].replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      date = d.toISOString();
    }
  }

  // Determine transaction subtype
  let type: ParsedMoMoSMS['type'] = 'payment';
  if (isIncome) {
    type = 'transfer_received';
  } else if (lower.includes('cash out') || lower.includes('kubikuza')) {
    type = 'cashout';
  } else if (lower.includes('airtime') || lower.includes('ifatabuguzi')) {
    type = 'airtime';
  } else if (lower.includes('sent') || lower.includes('yoherereje')) {
    type = 'transfer_sent';
  } else if (lower.includes('token') || lower.includes('cashpower') || lower.includes('eucl') || lower.includes('wasac')) {
    type = 'utility';
  }

  const suggestedCategory = inferCategory(vendor, text);

  return {
    originalText: rawText,
    provider,
    type,
    amount,
    currency,
    vendor,
    vendorCode,
    fee,
    newBalance,
    referenceId,
    date,
    suggestedCategory,
    isIncome
  };
}
