import { useState, useEffect, useRef, useCallback } from "react";
import logoImg from "/logo.png";

type Section = 'dash' | 'reg' | 'lab' | 'prog' | 'book' | 'staff' | 'fin' | 'off' | 'port';

interface LabData {
  h: string; w: string; age?: string;
  chest: string; waist: string; hips: string;
  thighR: string; thighL: string; armR: string; armL: string;
  bmi?: string; fat?: string; mus?: string;
}
interface HistoryEntry extends LabData { date: string; }
interface Member {
  id: number; name: string; addr: string; goal: string;
  chronic: string; bone: string; total: number; paid: number;
  debt: number; rem_sess: number; coach: string; img: string;
  lab: LabData; history: HistoryEntry[]; diet: string; train: string; date: string;
}
interface Staff { id: number; name: string; salary: number; task: string; loans: number; }
interface Offer { id: number; name: string; price: number; sess: number; }
interface Finance { date: string; desc: string; amt: number; type: 'in' | 'out'; }
interface Booking { mName: string; time: string; suitId: number; suitSize: string; }
interface Suit { id: number; size: string; status: 'avail' | 'booked' | 'broken'; }

const DEFAULT_SUITS: Suit[] = [
  {id:1,size:'S',status:'avail'},{id:2,size:'S',status:'avail'},
  {id:3,size:'M',status:'avail'},{id:4,size:'M',status:'avail'},
  {id:5,size:'L',status:'avail'},{id:6,size:'L',status:'avail'},
  {id:7,size:'XL',status:'avail'},{id:8,size:'XL',status:'avail'},
  {id:9,size:'XXL',status:'avail'},{id:10,size:'XXL',status:'avail'}
];
const DEFAULT_OFFERS: Offer[] = [{id:1,name:'باقة الافتتاح',price:500,sess:12}];
const EMPTY_LAB: LabData = {h:'',w:'',chest:'',waist:'',hips:'',thighR:'',thighL:'',armR:'',armL:''};

function loadFromLS<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveToLS(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }

const MOTIVATIONS = [
  '⚡ قوّتك الحقيقية تبدأ من هنا',
  '🔥 اليوم أقوى من أمس',
  '💪 EMS — الذكاء في خدمة جسمك',
  '🎯 كل جلسة خطوة نحو الكمال',
  '🚀 حوّل كهرباء التدريب إلى نتائج حقيقية',
  '⭐ المثابرة هي سر كل بطل',
];

// SVG for EMS Male Athlete
const EMSMaleSVG = () => (
  <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="maleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ccff00" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.9" />
      </linearGradient>
      <filter id="maleGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Body suit */}
    <ellipse cx="100" cy="55" rx="22" ry="22" fill="#1a1a1a" stroke="url(#maleGrad)" strokeWidth="2" filter="url(#maleGlow)" />
    <circle cx="100" cy="55" r="10" fill="url(#maleGrad)" opacity="0.6" />
    {/* Torso */}
    <path d="M72 80 Q100 70 128 80 L132 150 Q100 160 68 150 Z" fill="#111" stroke="url(#maleGrad)" strokeWidth="2" filter="url(#maleGlow)" />
    {/* EMS lines on torso */}
    <path d="M80 95 L120 95" stroke="#ccff00" strokeWidth="1" opacity="0.7" />
    <path d="M78 110 L122 110" stroke="#00e5ff" strokeWidth="1" opacity="0.7" />
    <path d="M80 125 L120 125" stroke="#ccff00" strokeWidth="1" opacity="0.7" />
    <path d="M82 140 L118 140" stroke="#00e5ff" strokeWidth="1" opacity="0.7" />
    {/* Left arm raised */}
    <path d="M72 85 L45 55 L30 50" stroke="url(#maleGrad)" strokeWidth="8" strokeLinecap="round" filter="url(#maleGlow)" />
    <circle cx="30" cy="50" r="5" fill="#ccff00" filter="url(#maleGlow)" />
    {/* Right arm raised */}
    <path d="M128 85 L155 55 L170 50" stroke="url(#maleGrad)" strokeWidth="8" strokeLinecap="round" filter="url(#maleGlow)" />
    <circle cx="170" cy="50" r="5" fill="#00e5ff" filter="url(#maleGlow)" />
    {/* Barbell */}
    <line x1="20" y1="45" x2="180" y2="45" stroke="#888" strokeWidth="4" strokeLinecap="round" />
    <rect x="10" y="35" width="14" height="20" rx="3" fill="#555" stroke="#ccff00" strokeWidth="1" />
    <rect x="176" y="35" width="14" height="20" rx="3" fill="#555" stroke="#ccff00" strokeWidth="1" />
    {/* Left leg */}
    <path d="M82 150 L78 200 L72 240" stroke="url(#maleGrad)" strokeWidth="10" strokeLinecap="round" filter="url(#maleGlow)" />
    {/* Right leg */}
    <path d="M118 150 L122 200 L128 240" stroke="url(#maleGrad)" strokeWidth="10" strokeLinecap="round" filter="url(#maleGlow)" />
    {/* Shoes */}
    <ellipse cx="72" cy="242" rx="15" ry="6" fill="#ccff00" opacity="0.8" filter="url(#maleGlow)" />
    <ellipse cx="128" cy="242" rx="15" ry="6" fill="#00e5ff" opacity="0.8" filter="url(#maleGlow)" />
    {/* EMS spark dots */}
    <circle cx="72" cy="85" r="4" fill="#ccff00" filter="url(#maleGlow)" />
    <circle cx="128" cy="85" r="4" fill="#ccff00" filter="url(#maleGlow)" />
    <circle cx="82" cy="155" r="3" fill="#00e5ff" filter="url(#maleGlow)" />
    <circle cx="118" cy="155" r="3" fill="#00e5ff" filter="url(#maleGlow)" />
    {/* Heartbeat line */}
    <path d="M55 175 L65 175 L70 160 L80 190 L90 170 L100 175 L145 175" stroke="#ff3333" strokeWidth="1.5" opacity="0.8" />
    {/* Label */}
    <text x="100" y="265" textAnchor="middle" fill="#ccff00" fontSize="11" fontFamily="Orbitron" fontWeight="700">MALE EMS</text>
  </svg>
);

// SVG for EMS Female Athlete
const EMSFemaleSVG = () => (
  <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="femaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff69b4" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.9" />
      </linearGradient>
      <filter id="femaleGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Head */}
    <ellipse cx="100" cy="45" rx="18" ry="20" fill="#1a1a1a" stroke="url(#femaleGrad)" strokeWidth="2" filter="url(#femaleGlow)" />
    <circle cx="100" cy="42" r="8" fill="url(#femaleGrad)" opacity="0.5" />
    {/* Hair */}
    <path d="M82 35 Q100 20 118 35" stroke="#ff69b4" strokeWidth="4" strokeLinecap="round" filter="url(#femaleGlow)" />
    {/* Torso - more feminine */}
    <path d="M80 68 Q100 62 120 68 L118 130 Q100 138 82 130 Z" fill="#111" stroke="url(#femaleGrad)" strokeWidth="2" filter="url(#femaleGlow)" />
    {/* EMS lines on torso */}
    <path d="M85 80 L115 80" stroke="#ff69b4" strokeWidth="1" opacity="0.7" />
    <path d="M83 95 L117 95" stroke="#00e5ff" strokeWidth="1" opacity="0.7" />
    <path d="M85 110 L115 110" stroke="#ff69b4" strokeWidth="1" opacity="0.7" />
    {/* Left arm - pose */}
    <path d="M80 72 L55 90 L42 110" stroke="url(#femaleGrad)" strokeWidth="7" strokeLinecap="round" filter="url(#femaleGlow)" />
    <circle cx="42" cy="110" r="4" fill="#ff69b4" filter="url(#femaleGlow)" />
    {/* Right arm - pose */}
    <path d="M120 72 L145 90 L158 110" stroke="url(#femaleGrad)" strokeWidth="7" strokeLinecap="round" filter="url(#femaleGlow)" />
    <circle cx="158" cy="110" r="4" fill="#00e5ff" filter="url(#femaleGlow)" />
    {/* Hips */}
    <path d="M82 130 L75 155 L125 155 L118 130 Z" fill="#111" stroke="url(#femaleGrad)" strokeWidth="2" filter="url(#femaleGlow)" />
    {/* Left leg */}
    <path d="M85 155 L80 205 L75 240" stroke="url(#femaleGrad)" strokeWidth="9" strokeLinecap="round" filter="url(#femaleGlow)" />
    {/* Right leg */}
    <path d="M115 155 L120 205 L125 240" stroke="url(#femaleGrad)" strokeWidth="9" strokeLinecap="round" filter="url(#femaleGlow)" />
    {/* Shoes */}
    <ellipse cx="75" cy="242" rx="14" ry="5" fill="#ff69b4" opacity="0.8" filter="url(#femaleGlow)" />
    <ellipse cx="125" cy="242" rx="14" ry="5" fill="#00e5ff" opacity="0.8" filter="url(#femaleGlow)" />
    {/* EMS spark dots */}
    <circle cx="80" cy="72" r="3" fill="#ff69b4" filter="url(#femaleGlow)" />
    <circle cx="120" cy="72" r="3" fill="#ff69b4" filter="url(#femaleGlow)" />
    {/* Heartbeat line */}
    <path d="M45 175 L55 175 L60 162 L70 188 L80 172 L90 175 L155 175" stroke="#ff3333" strokeWidth="1.5" opacity="0.8" />
    {/* Label */}
    <text x="100" y="265" textAnchor="middle" fill="#ff69b4" fontSize="11" fontFamily="Orbitron" fontWeight="700">FEMALE EMS</text>
  </svg>
);

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('dash');
  const [members, setMembers] = useState<Member[]>(() => loadFromLS('sl_m_v4', []));
  const [staff, setStaff] = useState<Staff[]>(() => loadFromLS('sl_s_v4', []));
  const [offers, setOffers] = useState<Offer[]>(() => loadFromLS('sl_o_v4', DEFAULT_OFFERS));
  const [finance, setFinance] = useState<Finance[]>(() => loadFromLS('sl_f_v4', []));
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromLS('sl_b_v4', []));
  const [suits, setSuits] = useState<Suit[]>(() => loadFromLS('sl_suits_v4', DEFAULT_SUITS));

  const [toast, setToast] = useState('');
  const [motoIdx, setMotoIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Registration form
  const [regImg, setRegImg] = useState('');
  const [regName, setRegName] = useState('');
  const [regAddr, setRegAddr] = useState('');
  const [regGoal, setRegGoal] = useState('تنشيف دهون');
  const [regChronic, setRegChronic] = useState('');
  const [regBone, setRegBone] = useState('');
  const [regOfferId, setRegOfferId] = useState<number | null>(null);
  const [regPaid, setRegPaid] = useState('');
  const [regCoach, setRegCoach] = useState('');
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [labMemberId, setLabMemberId] = useState('');
  const [labData, setLabData] = useState<LabData>(EMPTY_LAB);
  const [labAge, setLabAge] = useState('');
  const [progMemberId, setProgMemberId] = useState('');
  const [diet, setDiet] = useState('');
  const [train, setTrain] = useState('');
  const [bookMemberId, setBookMemberId] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookSuitId, setBookSuitId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffSalary, setStaffSalary] = useState('');
  const [staffTask, setStaffTask] = useState('');
  const [finDesc, setFinDesc] = useState('');
  const [finAmt, setFinAmt] = useState('');
  const [offName, setOffName] = useState('');
  const [offPrice, setOffPrice] = useState('');
  const [offSess, setOffSess] = useState('');
  const [portMemberId, setPortMemberId] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 3000);
  }, []);

  useEffect(() => { saveToLS('sl_m_v4', members); }, [members]);
  useEffect(() => { saveToLS('sl_s_v4', staff); }, [staff]);
  useEffect(() => { saveToLS('sl_o_v4', offers); }, [offers]);
  useEffect(() => { saveToLS('sl_f_v4', finance); }, [finance]);
  useEffect(() => { saveToLS('sl_b_v4', bookings); }, [bookings]);
  useEffect(() => { saveToLS('sl_suits_v4', suits); }, [suits]);

  // Motivation rotator
  useEffect(() => {
    const t = setInterval(() => setMotoIdx(i => (i + 1) % MOTIVATIONS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (offers.length > 0 && regOfferId === null) setRegOfferId(offers[0].id);
  }, [offers, regOfferId]);

  const selectedOffer = offers.find(o => o.id === regOfferId);
  const regDebt = selectedOffer ? (selectedOffer.price - (parseFloat(regPaid) || 0)) : 0;

  function handleRegImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setRegImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function saveNewMember() {
    if (!regName.trim()) return showToast('يرجى إدخال الاسم');
    if (!selectedOffer) return showToast('يرجى اختيار باقة');
    const newM: Member = {
      id: Date.now(), name: regName.trim(), addr: regAddr, goal: regGoal,
      chronic: regChronic, bone: regBone,
      total: selectedOffer.price, paid: parseFloat(regPaid) || 0,
      debt: regDebt, rem_sess: selectedOffer.sess,
      coach: regCoach || (staff[0]?.name ?? ''),
      img: regImg, lab: { ...EMPTY_LAB }, history: [], diet: '', train: '',
      date: new Date().toLocaleDateString('ar-EG')
    };
    setMembers(prev => [...prev, newM]);
    if (newM.paid > 0) {
      setFinance(prev => [...prev, { date: new Date().toLocaleString(), desc: `اشتراك جديد: ${newM.name}`, amt: newM.paid, type: 'in' }]);
    }
    setRegName(''); setRegAddr(''); setRegChronic(''); setRegBone(''); setRegPaid(''); setRegImg('');
    showToast('تمت الإضافة بنجاح ✅');
    setActiveSection('dash');
  }

  function calcAI(data: LabData) {
    const h = parseFloat(data.h) / 100, w = parseFloat(data.w);
    if (h > 0 && w > 0) {
      const bmi = (w / (h * h)).toFixed(1);
      return { bmi, fat: (parseFloat(bmi) * 1.2).toFixed(1) + '%', mus: (100 - parseFloat(bmi) * 1.2).toFixed(1) + '%' };
    }
    return { bmi: '-', fat: '-', mus: '-' };
  }
  const aiStats = calcAI(labData);

  function loadMemberLab(id: string) {
    setLabMemberId(id);
    const m = members.find(x => String(x.id) === id);
    if (m) { setLabData({ ...EMPTY_LAB, ...m.lab }); setLabAge(m.lab.age || ''); }
    else setLabData(EMPTY_LAB);
  }

  function saveMemberLab() {
    const m = members.find(x => String(x.id) === labMemberId);
    if (!m) return showToast('اختر مشترك أولاً');
    const entry: HistoryEntry = { ...labData, date: new Date().toLocaleDateString('ar-EG'), ...aiStats };
    setMembers(prev => prev.map(x => x.id === m.id ? { ...x, lab: { ...labData, ...aiStats }, history: [...(x.history || []), entry] } : x));
    showToast('تم حفظ القياسات ✅');
  }

  function loadMemberProg(id: string) {
    setProgMemberId(id);
    const m = members.find(x => String(x.id) === id);
    if (m) { setDiet(m.diet); setTrain(m.train); }
  }

  function generateSmartProg() {
    const m = members.find(x => String(x.id) === progMemberId);
    if (!m) return showToast('اختر مشترك أولاً');
    const cals = (parseFloat(m.lab.w) || 70) * 25;
    setDiet(`خطة التغذية لـ ${m.name}:\n- السعرات: ${cals} kcal\n- بروتين عالي لتناسب تمارين EMS\n- فطور: بيض + كربوهيدرات معقدة\n- غداء: بروتين حيواني + خضار\n- تحذير طبي: ${m.chronic || 'لا يوجد'}`);
    setTrain(`خطة تدريب EMS:\n- التردد: 85Hz لزيادة القوة\n- التركيز: ${m.bone || 'كامل العضلات'}\n- ملاحظة القياسات: الخصر الحالي ${m.lab.waist}سم`);
  }

  function saveMemberProg() {
    const m = members.find(x => String(x.id) === progMemberId);
    if (!m) return showToast('اختر مشترك أولاً');
    setMembers(prev => prev.map(x => x.id === m.id ? { ...x, diet, train } : x));
    showToast('حُفظت الخطة ✅');
  }

  function confirmBooking() {
    if (!bookMemberId || !bookSuitId || !bookDate) return showToast('اكمل بيانات الحجز!');
    const m = members.find(x => String(x.id) === bookMemberId);
    if (!m) return;
    if (m.rem_sess <= 0) return showToast('عذراً، لا يوجد جلسات متبقية!');
    const suit = suits.find(s => String(s.id) === bookSuitId);
    if (!suit) return;
    setMembers(prev => prev.map(x => x.id === m.id ? { ...x, rem_sess: x.rem_sess - 1 } : x));
    setSuits(prev => prev.map(s => String(s.id) === bookSuitId ? { ...s, status: 'booked' } : s));
    setBookings(prev => [...prev, { mName: m.name, time: bookDate, suitId: suit.id, suitSize: suit.size }]);
    setBookMemberId(''); setBookDate(''); setBookSuitId('');
    showToast('تم تثبيت الموعد بنجاح ✅');
  }

  function toggleSuit(id: number) {
    setSuits(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'avail' ? 'broken' : 'avail' } : s));
  }

  function addNewStaff() {
    if (!staffName.trim()) return showToast('أدخل اسم الموظف');
    setStaff(prev => [...prev, { id: Date.now(), name: staffName, salary: parseFloat(staffSalary) || 0, task: staffTask, loans: 0 }]);
    setStaffName(''); setStaffSalary(''); setStaffTask('');
    showToast('تمت الإضافة ✅');
  }

  function addLoan(id: number) {
    const amt = parseFloat(prompt('المبلغ:') || '0');
    if (!amt) return;
    const s = staff.find(x => x.id === id);
    if (!s) return;
    setStaff(prev => prev.map(x => x.id === id ? { ...x, loans: x.loans + amt } : x));
    setFinance(prev => [...prev, { date: new Date().toLocaleString(), desc: `سلفة: ${s.name}`, amt, type: 'out' }]);
    showToast('تم تسجيل السلفة');
  }

  function addExpense() {
    const amt = parseFloat(finAmt);
    if (!amt) return showToast('أدخل المبلغ');
    setFinance(prev => [...prev, { date: new Date().toLocaleString(), desc: finDesc, amt, type: 'out' }]);
    setFinDesc(''); setFinAmt('');
    showToast('تم تسجيل الصرف');
  }

  function addNewOffer() {
    if (!offName.trim() || !offPrice || !offSess) return showToast('اكمل بيانات العرض');
    setOffers(prev => [...prev, { id: Date.now(), name: offName, price: parseFloat(offPrice), sess: parseInt(offSess) }]);
    setOffName(''); setOffPrice(''); setOffSess('');
    showToast('تمت إضافة العرض ✅');
  }

  function deleteOffer(id: number) {
    if (!confirm('حذف هذا العرض؟')) return;
    setOffers(prev => prev.filter(o => o.id !== id));
  }

  const finIncome = finance.filter(x => x.type === 'in').reduce((a, b) => a + b.amt, 0);
  const finExpense = finance.filter(x => x.type === 'out').reduce((a, b) => a + b.amt, 0);
  const finNet = finIncome - finExpense;

  const portMember = members.find(x => String(x.id) === portMemberId);
  const bookMember = members.find(x => String(x.id) === bookMemberId);
  const availSuits = suits.filter(s => s.status === 'avail');

  const menuItems: { id: Section; icon: string; label: string }[] = [
    { id: 'dash', icon: '📊', label: 'الرادار الذكي' },
    { id: 'reg', icon: '👤', label: 'تسجيل عضو جديد' },
    { id: 'lab', icon: '🔬', label: 'قياسات AI' },
    { id: 'prog', icon: '🍎', label: 'الغذاء والتدريب' },
    { id: 'book', icon: '📅', label: 'الحجز والمخزون' },
    { id: 'staff', icon: '👔', label: 'الموظفين والمهام' },
    { id: 'fin', icon: '💰', label: 'التقارير المالية' },
    { id: 'off', icon: '🎁', label: 'إدارة العروض' },
    { id: 'port', icon: '📂', label: 'الملف الشامل' },
  ];

  // Shared styles
  const C = {
    inp: { background: '#080808', border: '1px solid #2a2a2a', color: '#fff', padding: '12px 14px', borderRadius: '10px', width: '100%', marginTop: '8px', outline: 'none', fontSize: '14px', fontFamily: "'Cairo', sans-serif" } as React.CSSProperties,
    lbl: { color: '#777', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" } as React.CSSProperties,
    card: (extra?: React.CSSProperties): React.CSSProperties => ({ background: 'linear-gradient(145deg, #0e0e0e, #141414)', border: '1px solid #1e1e1e', padding: '25px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', ...extra }),
    g3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' } as React.CSSProperties,
    g4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' } as React.CSSProperties,
    btnN: (extra?: React.CSSProperties): React.CSSProperties => ({ background: 'linear-gradient(135deg, #ccff00, #aadd00)', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', width: '100%', marginTop: '15px', fontSize: '15px', fontFamily: "'Cairo', sans-serif", letterSpacing: '0.5px', boxShadow: '0 4px 20px rgba(204,255,0,0.3)', ...extra }),
    btnA: (extra?: React.CSSProperties): React.CSSProperties => ({ background: 'linear-gradient(135deg, #00e5ff, #0099bb)', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', width: '100%', marginTop: '15px', fontSize: '14px', fontFamily: "'Cairo', sans-serif", boxShadow: '0 4px 20px rgba(0,229,255,0.3)', ...extra }),
    h3: { color: '#fff', marginTop: 0, marginBottom: '20px', fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: '18px' } as React.CSSProperties,
    h4N: { color: '#ccff00', marginTop: '25px', borderBottom: '1px solid #1e1e1e', paddingBottom: '8px', fontFamily: "'Cairo', sans-serif", fontWeight: 700 } as React.CSSProperties,
    h4A: { color: '#00e5ff', marginTop: '25px', borderBottom: '1px solid #1e1e1e', paddingBottom: '8px', fontFamily: "'Cairo', sans-serif", fontWeight: 700 } as React.CSSProperties,
  };

  const secStyle = (id: Section): React.CSSProperties => ({ display: activeSection === id ? 'block' : 'none' });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#050505', fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>

      {/* ===== SIDEBAR ===== */}
      <div className="no-print" style={{ width: sidebarOpen ? '280px' : '70px', background: 'linear-gradient(180deg, #000 0%, #050505 100%)', borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', padding: sidebarOpen ? '16px' : '12px', overflowY: 'auto', transition: 'width 0.3s ease', flexShrink: 0, position: 'relative' }}>

        {/* Logo + Name */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <img src={logoImg} alt="Logo" style={{ width: sidebarOpen ? '80px' : '46px', height: sidebarOpen ? '80px' : '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccff00', boxShadow: '0 0 15px rgba(204,255,0,0.4)', transition: 'all 0.3s', display: 'block', margin: '0 auto' }} />
          </div>
          {sidebarOpen && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ color: '#ccff00', fontSize: '13px', fontWeight: 900, fontFamily: "'Orbitron', monospace", letterSpacing: '1px', lineHeight: 1.2 }}>SMART</div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: 900, fontFamily: "'Orbitron', monospace", letterSpacing: '2px' }}>SPORT LAND</div>
              <div style={{ color: '#00e5ff', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '3px', marginTop: '2px', opacity: 0.8 }}>EMS · NABLUS · PALESTINE</div>
              <div style={{ marginTop: '10px', height: '1px', background: 'linear-gradient(90deg, transparent, #ccff00, transparent)' }} />
            </div>
          )}
        </div>

        {/* Motivation ticker - only when sidebar open */}
        {sidebarOpen && (
          <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '8px 12px', marginBottom: '16px', overflow: 'hidden', height: '40px', position: 'relative' }}>
            <div style={{ color: '#ccff00', fontSize: '11px', fontWeight: 700, fontFamily: "'Cairo', sans-serif", textAlign: 'center', animation: 'fadeInUp 0.5s ease', key: motoIdx }}>
              {MOTIVATIONS[motoIdx]}
            </div>
          </div>
        )}

        {/* Menu */}
        <nav style={{ flex: 1 }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
              padding: sidebarOpen ? '12px 16px' : '12px', marginBottom: '6px', borderRadius: '12px',
              cursor: 'pointer', color: activeSection === item.id ? '#000' : '#888',
              fontWeight: activeSection === item.id ? 900 : 600,
              border: 'none', textAlign: 'right' as const,
              background: activeSection === item.id ? 'linear-gradient(135deg, #ccff00, #aadd00)' : 'transparent',
              width: '100%', fontSize: '13px', display: 'flex', alignItems: 'center',
              gap: '10px', direction: 'rtl' as const, fontFamily: "'Cairo', sans-serif",
              transition: 'all 0.2s',
              boxShadow: activeSection === item.id ? '0 4px 15px rgba(204,255,0,0.3)' : 'none',
            }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Stats at bottom */}
        {sidebarOpen && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#0a0a0a', borderRadius: '12px', border: '1px solid #1e1e1e' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'center' }}>
              {[
                { label: 'أعضاء', val: members.length, color: '#ccff00' },
                { label: 'موظفين', val: staff.length, color: '#00e5ff' },
                { label: 'حجوزات', val: bookings.length, color: '#ff69b4' },
                { label: 'عروض', val: offers.length, color: '#00ff88' },
              ].map(s => (
                <div key={s.label} style={{ padding: '6px', background: '#111', borderRadius: '8px' }}>
                  <div style={{ color: s.color, fontSize: '18px', fontWeight: 900, fontFamily: "'Orbitron', monospace" }}>{s.val}</div>
                  <div style={{ color: '#555', fontSize: '10px', fontFamily: "'Cairo', sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'radial-gradient(ellipse at top, #111 0%, #050505 60%)' }}>

        {/* ===== DASHBOARD ===== */}
        <div style={secStyle('dash')} className="section-animate">

          {/* Hero Banner */}
          <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)', border: '1px solid #1e1e1e', borderRadius: '24px', padding: '30px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(204,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(204,255,0,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', borderRadius: '24px' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>

              {/* Left athlete */}
              <div className="float-anim" style={{ width: '160px', height: '200px', flexShrink: 0, opacity: 0.9 }}>
                <EMSMaleSVG />
              </div>

              {/* Center content */}
              <div style={{ flex: 1, textAlign: 'center', padding: '0 20px' }}>
                <div style={{ color: '#ccff00', fontSize: '11px', fontFamily: "'Orbitron', monospace", letterSpacing: '4px', marginBottom: '8px', opacity: 0.8 }}>NABLUS · PALESTINE</div>
                <h1 style={{ margin: 0, fontFamily: "'Orbitron', monospace", fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 900, background: 'linear-gradient(135deg, #ccff00, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>SMART<br />SPORT LAND</h1>
                <div style={{ color: '#00e5ff', fontSize: '12px', fontFamily: "'Orbitron', monospace", letterSpacing: '3px', marginTop: '6px' }}>EMS TRAINING CENTER</div>

                {/* Motivation display */}
                <div style={{ marginTop: '16px', padding: '12px 20px', background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: '30px', display: 'inline-block', minWidth: '280px' }}>
                  <div style={{ color: '#ccff00', fontSize: '13px', fontWeight: 700, fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
                    {MOTIVATIONS[motoIdx]}
                  </div>
                </div>

                {/* Heartbeat line */}
                <div style={{ marginTop: '16px' }}>
                  <svg viewBox="0 0 300 40" style={{ width: '100%', maxWidth: '300px' }}>
                    <path d="M0 20 L50 20 L65 20 L75 5 L90 35 L105 10 L115 20 L130 20 L145 20 L160 5 L175 35 L190 10 L200 20 L250 20 L300 20" stroke="#ff3333" strokeWidth="2" fill="none" opacity="0.8" />
                    <circle cx="150" cy="20" r="3" fill="#ff3333" />
                  </svg>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'أعضاء نشطين', val: members.length, col: '#ccff00' },
                    { label: 'جلسات محجوزة', val: bookings.length, col: '#00e5ff' },
                    { label: 'أجهزة متاحة', val: suits.filter(s => s.status === 'avail').length, col: '#00ff88' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${s.col}33`, borderRadius: '12px', padding: '8px 16px', textAlign: 'center' }}>
                      <div style={{ color: s.col, fontSize: '22px', fontWeight: 900, fontFamily: "'Orbitron', monospace" }}>{s.val}</div>
                      <div style={{ color: '#666', fontSize: '10px', fontFamily: "'Cairo', sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right athlete */}
              <div className="float-anim" style={{ width: '160px', height: '200px', flexShrink: 0, opacity: 0.9, animationDelay: '1s' }}>
                <EMSFemaleSVG />
              </div>
            </div>
          </div>

          {/* Dashboard cards */}
          <div style={{ ...C.g3, marginBottom: '20px' }}>
            <div style={C.card({ borderTop: '3px solid #ff3333' })}>
              <h3 style={{ ...C.h3, color: '#ff3333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💸</span> ديون المشتركين
              </h3>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {members.filter(x => x.debt > 0).length === 0
                  ? <p style={{ color: '#444', fontFamily: "'Cairo', sans-serif", textAlign: 'center', padding: '20px' }}>✅ لا ديون مسجلة</p>
                  : members.filter(x => x.debt > 0).map(x => (
                    <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,51,51,0.05)', marginBottom: '6px', border: '1px solid rgba(255,51,51,0.15)' }}>
                      <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}>{x.name}</span>
                      <span style={{ color: '#ff3333', fontWeight: 900, fontFamily: "'Orbitron', monospace", fontSize: '13px' }}>{x.debt} ₪</span>
                    </div>
                  ))}
              </div>
            </div>
            <div style={C.card({ borderTop: '3px solid #00e5ff' })}>
              <h3 style={{ ...C.h3, color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📅</span> آخر الحجوزات
              </h3>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {bookings.length === 0
                  ? <p style={{ color: '#444', fontFamily: "'Cairo', sans-serif", textAlign: 'center', padding: '20px' }}>لا حجوزات بعد</p>
                  : [...bookings].reverse().slice(0, 6).map((x, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'rgba(0,229,255,0.05)', borderRadius: '8px', marginBottom: '6px', borderRight: '3px solid #00e5ff', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>
                      <strong>{x.mName}</strong> | {x.time.replace('T', ' ')} | بدلة {x.suitId}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* EMS Suits Grid */}
          <div style={C.card()}>
            <h3 style={{ ...C.h3, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚡</span>
              <span>حالة أجهزة EMS الـ 10</span>
              <span style={{ fontSize: '12px', color: '#555', fontWeight: 400 }}>(اضغط لتغيير الحالة)</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {suits.map(suit => {
                const cfg = {
                  avail: { color: '#00ff88', label: 'متاح', bg: 'rgba(0,255,136,0.06)' },
                  booked: { color: '#00e5ff', label: 'محجوز', bg: 'rgba(0,229,255,0.06)' },
                  broken: { color: '#ff3333', label: 'معطل', bg: 'rgba(255,51,51,0.06)' },
                }[suit.status];
                return (
                  <div key={suit.id} onClick={() => toggleSuit(suit.id)} style={{ padding: '14px 10px', borderRadius: '14px', border: `1px solid ${cfg.color}55`, textAlign: 'center', cursor: 'pointer', fontWeight: 700, color: cfg.color, background: cfg.bg, opacity: suit.status === 'broken' ? 0.5 : 1, transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '16px', fontFamily: "'Orbitron', monospace", fontWeight: 900 }}>{suit.size}</div>
                    <div style={{ fontSize: '9px', marginTop: '4px', fontFamily: "'Cairo', sans-serif", opacity: 0.8 }}>{cfg.label}</div>
                    <div style={{ fontSize: '9px', color: '#444', fontFamily: "'Orbitron', monospace" }}>#{suit.id}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== REGISTRATION ===== */}
        <div style={secStyle('reg')} className="section-animate">
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src={logoImg} alt="logo" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccff00' }} />
            <div>
              <h2 style={{ margin: 0, fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: '22px' }}>تسجيل عضو جديد</h2>
              <div style={{ color: '#666', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>SMART SPORT LAND — نظام العضوية</div>
            </div>
          </div>
          <div style={C.card()}>
            {/* Photo */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div onClick={() => imgInputRef.current?.click()} style={{ width: '130px', height: '130px', borderRadius: '50%', border: regImg ? '3px solid #ccff00' : '3px dashed #333', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: '#080808', boxShadow: regImg ? '0 0 20px rgba(204,255,0,0.3)' : 'none', transition: 'all 0.3s' }}>
                {regImg ? <img src={regImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ textAlign: 'center', color: '#444' }}><div style={{ fontSize: '28px' }}>📷</div><div style={{ fontSize: '11px', fontFamily: "'Cairo', sans-serif" }}>صورة المشترك</div></div>}
              </div>
              <input ref={imgInputRef} type="file" accept="image/*" hidden onChange={handleRegImg} />
            </div>
            <div style={C.g3}>
              {[
                { label: 'الاسم الكامل', key: 'name', type: 'text', ph: 'الاسم الرباعي', val: regName, set: setRegName },
                { label: 'السكن / الهاتف', key: 'addr', type: 'text', ph: 'العنوان ورقم التواصل', val: regAddr, set: setRegAddr },
              ].map(f => (
                <div key={f.key}>
                  <label style={C.lbl}>{f.label}</label>
                  <input style={C.inp} type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
              <div>
                <label style={C.lbl}>الهدف الرئيسي</label>
                <select style={C.inp} value={regGoal} onChange={e => setRegGoal(e.target.value)}>
                  {['تنشيف دهون', 'تضخيم عضلي', 'لياقة بدنية', 'علاجي / إصابات'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div style={{ ...C.g3, marginTop: '15px' }}>
              <div>
                <label style={C.lbl}>أمراض مزمنة</label>
                <input style={C.inp} type="text" placeholder="سكري، ضغط، قلب..." value={regChronic} onChange={e => setRegChronic(e.target.value)} />
              </div>
              <div>
                <label style={C.lbl}>إصابات هيكلية</label>
                <input style={C.inp} type="text" placeholder="ديسك، مفاصل، كسور..." value={regBone} onChange={e => setRegBone(e.target.value)} />
              </div>
              <div>
                <label style={C.lbl}>اختيار الباقة</label>
                <select style={C.inp} value={regOfferId ?? ''} onChange={e => setRegOfferId(Number(e.target.value))}>
                  {offers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.price} ₪ / {o.sess} جلسة)</option>)}
                </select>
              </div>
            </div>
            <div style={{ ...C.g3, marginTop: '15px' }}>
              <div>
                <label style={C.lbl}>المبلغ المدفوع (₪)</label>
                <input style={C.inp} type="number" value={regPaid} onChange={e => setRegPaid(e.target.value)} />
              </div>
              <div>
                <label style={C.lbl}>الدين المتبقي (₪)</label>
                <input style={{ ...C.inp, color: '#ff3333', fontWeight: 900, fontFamily: "'Orbitron', monospace" }} type="text" readOnly value={`${regDebt} ₪`} />
              </div>
              <div>
                <label style={C.lbl}>المدرب المباشر</label>
                <select style={C.inp} value={regCoach} onChange={e => setRegCoach(e.target.value)}>
                  {staff.length === 0 ? <option>لا يوجد مدربين</option> : staff.map(s => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <button style={C.btnN()} onClick={saveNewMember}>⚡ تثبيت الاشتراك بنجاح</button>
          </div>
        </div>

        {/* ===== LAB ===== */}
        <div style={secStyle('lab')} className="section-animate">
          <div style={C.card()}>
            <h3 style={C.h3}>🔬 تتبع القياسات الحيوية والبدنية — تحليل AI</h3>
            <select style={C.inp} value={labMemberId} onChange={e => loadMemberLab(e.target.value)}>
              <option value="">-- اختر مشترك --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <h4 style={C.h4N}>📏 القياسات الأساسية</h4>
            <div style={C.g3}>
              <div><label style={C.lbl}>الطول (سم)</label><input style={C.inp} type="number" placeholder="175" value={labData.h} onChange={e => setLabData(p => ({ ...p, h: e.target.value }))} /></div>
              <div><label style={C.lbl}>الوزن (كغم)</label><input style={C.inp} type="number" placeholder="75" value={labData.w} onChange={e => setLabData(p => ({ ...p, w: e.target.value }))} /></div>
              <div><label style={C.lbl}>العمر</label><input style={C.inp} type="number" placeholder="25" value={labAge} onChange={e => setLabAge(e.target.value)} /></div>
            </div>
            <h4 style={C.h4A}>📐 قياسات محيط الجسم (سم)</h4>
            <div style={C.g4}>
              {[
                { label: 'الصدر', field: 'chest' }, { label: 'الخصر', field: 'waist' }, { label: 'الأرداف', field: 'hips' },
                { label: 'الفخذ (يمين)', field: 'thighR' }, { label: 'الفخذ (يسار)', field: 'thighL' },
                { label: 'الذراع (يمين)', field: 'armR' }, { label: 'الذراع (يسار)', field: 'armL' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label style={C.lbl}>{label}</label>
                  <input style={C.inp} type="number" placeholder="0" value={(labData as Record<string, string>)[field] || ''} onChange={e => setLabData(p => ({ ...p, [field]: e.target.value }))} />
                </div>
              ))}
            </div>
            {/* AI Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '24px' }}>
              {[
                { label: 'BMI', val: aiStats.bmi, col: '#ccff00', icon: '⚖️' },
                { label: 'نسبة الدهون', val: aiStats.fat, col: '#ff3333', icon: '🔥' },
                { label: 'نسبة العضل', val: aiStats.mus, col: '#00ff88', icon: '💪' },
              ].map(s => (
                <div key={s.label} style={{ background: `linear-gradient(145deg, #0a0a0a, #111)`, border: `1px solid ${s.col}33`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                  <div style={{ color: '#666', fontSize: '12px', fontFamily: "'Cairo', sans-serif", marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ color: s.col, fontSize: '28px', fontWeight: 900, fontFamily: "'Orbitron', monospace" }}>{s.val}</div>
                </div>
              ))}
            </div>
            <button style={C.btnN()} onClick={saveMemberLab}>💾 حفظ القياسات وتحديث السجل</button>
            {labMemberId && (() => {
              const m = members.find(x => String(x.id) === labMemberId);
              if (!m?.history?.length) return null;
              return (
                <div style={{ marginTop: '24px' }}>
                  <h4 style={C.h4N}>📜 سجل التطور التاريخي</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', fontSize: '13px' }}>
                      <thead><tr>{['التاريخ', 'الوزن', 'الخصر', 'الدهون', 'BMI'].map(h => <th key={h} style={{ color: '#555', textAlign: 'right', padding: '8px', fontFamily: "'Cairo', sans-serif" }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {[...m.history].reverse().map((h, i) => (
                          <tr key={i}>{[h.date, h.w + ' كغم', h.waist + ' سم', h.fat, h.bmi].map((v, j) => (
                            <td key={j} style={{ background: '#0e0e0e', padding: '10px', borderRadius: j === 0 ? '0 8px 8px 0' : j === 4 ? '8px 0 0 8px' : undefined, fontFamily: j === 0 ? "'Cairo', sans-serif" : "'Orbitron', monospace", fontSize: '12px' }}>{v}</td>
                          ))}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ===== PROGRAM ===== */}
        <div style={secStyle('prog')} className="section-animate">
          <div style={C.card()}>
            <h3 style={C.h3}>🍎 تفاصيل خطة التغذية والتدريب</h3>
            <select style={C.inp} value={progMemberId} onChange={e => loadMemberProg(e.target.value)}>
              <option value="">-- اختر مشترك --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button style={C.btnA()} onClick={generateSmartProg}>✨ توليد الخطة الذكية بالـ AI</button>
            <div style={{ ...C.g3, marginTop: '20px' }}>
              <div>
                <label style={{ ...C.lbl, fontSize: '13px', color: '#00ff88' }}>🥗 نظام التغذية (وجبة بوجبة)</label>
                <textarea style={{ ...C.inp, height: '320px', resize: 'vertical' as const }} value={diet} onChange={e => setDiet(e.target.value)} />
              </div>
              <div>
                <label style={{ ...C.lbl, fontSize: '13px', color: '#00e5ff' }}>⚡ خطة تدريب EMS (الترددات)</label>
                <textarea style={{ ...C.inp, height: '320px', resize: 'vertical' as const }} value={train} onChange={e => setTrain(e.target.value)} />
              </div>
            </div>
            <button style={C.btnN()} onClick={saveMemberProg}>💾 حفظ وتحديث الخطة</button>
          </div>
        </div>

        {/* ===== BOOKING ===== */}
        <div style={secStyle('book')} className="section-animate">
          <div style={C.card()}>
            <h3 style={C.h3}>📅 حجز جلسة EMS — تتبع البدلات</h3>
            <div style={C.g3}>
              <div>
                <label style={C.lbl}>المشترك</label>
                <select style={C.inp} value={bookMemberId} onChange={e => setBookMemberId(e.target.value)}>
                  <option value="">-- اختر مشترك --</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {bookMember && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(204,255,0,0.08)', borderRadius: '8px', border: '1px solid rgba(204,255,0,0.2)' }}>
                    <span style={{ color: '#888', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>الجلسات المتبقية: </span>
                    <span style={{ color: '#ccff00', fontWeight: 900, fontFamily: "'Orbitron', monospace" }}>{bookMember.rem_sess}</span>
                  </div>
                )}
              </div>
              <div>
                <label style={C.lbl}>وقت الحجز</label>
                <input style={C.inp} type="datetime-local" value={bookDate} onChange={e => setBookDate(e.target.value)} />
              </div>
              <div>
                <label style={C.lbl}>البدلة المتوفرة ({availSuits.length} متاح)</label>
                <select style={C.inp} value={bookSuitId} onChange={e => setBookSuitId(e.target.value)}>
                  <option value="">-- اختر بدلة --</option>
                  {availSuits.map(s => <option key={s.id} value={s.id}>بدلة {s.id} — مقاس {s.size}</option>)}
                </select>
              </div>
            </div>
            <button style={C.btnN()} onClick={confirmBooking}>⚡ تثبيت الموعد وخصم جلسة</button>
          </div>
          {bookings.length > 0 && (
            <div style={C.card()}>
              <h3 style={C.h3}>📋 سجل الحجوزات</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                  <thead><tr>{['المشترك', 'التاريخ والوقت', 'رقم البدلة', 'المقاس'].map(h => <th key={h} style={{ color: '#555', textAlign: 'right', padding: '8px', fontFamily: "'Cairo', sans-serif", fontSize: '12px' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[...bookings].reverse().map((b, i) => (
                      <tr key={i}>
                        {[b.mName, b.time.replace('T', ' '), `بدلة ${b.suitId}`, b.suitSize].map((v, j) => (
                          <td key={j} style={{ background: '#0e0e0e', padding: '10px', borderRadius: j === 0 ? '0 8px 8px 0' : j === 3 ? '8px 0 0 8px' : undefined, fontFamily: j === 0 ? "'Cairo', sans-serif" : j === 2 ? "'Orbitron', monospace" : "'Cairo', sans-serif", fontSize: '13px' }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ===== STAFF ===== */}
        <div style={secStyle('staff')} className="section-animate">
          <div style={C.card()}>
            <h3 style={C.h3}>👔 إدارة الطاقم والمهام</h3>
            <div style={C.g3}>
              <div><label style={C.lbl}>اسم الموظف</label><input style={C.inp} type="text" placeholder="الاسم الكامل" value={staffName} onChange={e => setStaffName(e.target.value)} /></div>
              <div><label style={C.lbl}>الراتب الأساسي (₪)</label><input style={C.inp} type="number" placeholder="0" value={staffSalary} onChange={e => setStaffSalary(e.target.value)} /></div>
              <div><label style={C.lbl}>المهمة الوظيفية</label><input style={C.inp} type="text" placeholder="مدرب، مستقبل..." value={staffTask} onChange={e => setStaffTask(e.target.value)} /></div>
            </div>
            <button style={C.btnN()} onClick={addNewStaff}>➕ إضافة موظف جديد</button>
          </div>
          {staff.length > 0 && (
            <div style={C.card()}>
              <h3 style={C.h3}>📋 قائمة الطاقم</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                  <thead><tr>{['الموظف', 'المهمة', 'الراتب', 'السلف', 'الصافي', 'إجراء'].map(h => <th key={h} style={{ color: '#555', textAlign: 'right', padding: '8px', fontFamily: "'Cairo', sans-serif", fontSize: '12px' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {staff.map(x => (
                      <tr key={x.id}>
                        <td style={{ background: '#0e0e0e', padding: '12px', borderRadius: '0 8px 8px 0', fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>{x.name}</td>
                        <td style={{ background: '#0e0e0e', padding: '12px', fontFamily: "'Cairo', sans-serif", color: '#888' }}>{x.task}</td>
                        <td style={{ background: '#0e0e0e', padding: '12px', fontFamily: "'Orbitron', monospace", color: '#00ff88', fontSize: '13px' }}>{x.salary} ₪</td>
                        <td style={{ background: '#0e0e0e', padding: '12px', fontFamily: "'Orbitron', monospace", color: '#ff3333', fontSize: '13px' }}>{x.loans} ₪</td>
                        <td style={{ background: '#0e0e0e', padding: '12px', fontFamily: "'Orbitron', monospace", color: '#ccff00', fontSize: '13px', fontWeight: 900 }}>{x.salary - x.loans} ₪</td>
                        <td style={{ background: '#0e0e0e', padding: '12px', borderRadius: '8px 0 0 8px' }}>
                          <button onClick={() => addLoan(x.id)} style={{ background: 'rgba(255,51,51,0.15)', color: '#ff3333', border: '1px solid rgba(255,51,51,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>سلفة</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ===== FINANCE ===== */}
        <div style={secStyle('fin')} className="section-animate">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }} className="no-print">
            {[
              { label: 'إجمالي الدخل', val: finIncome, col: '#00ff88', icon: '📈' },
              { label: 'إجمالي الصرف', val: finExpense, col: '#ff3333', icon: '📉' },
              { label: 'الربح الفعلي', val: finNet, col: '#ccff00', icon: '💰' },
            ].map(s => (
              <div key={s.label} style={{ ...C.card({ textAlign: 'center' }), border: `1px solid ${s.col}33` }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ color: '#666', fontSize: '12px', fontFamily: "'Cairo', sans-serif", marginBottom: '4px' }}>{s.label}</div>
                <div style={{ color: s.col, fontSize: '26px', fontWeight: 900, fontFamily: "'Orbitron', monospace" }}>{s.val.toFixed(0)} ₪</div>
              </div>
            ))}
          </div>
          <div style={C.card()} className="no-print">
            <h3 style={C.h3}>💸 تسجيل نفقات إضافية</h3>
            <div style={C.g3}>
              <div><label style={C.lbl}>البيان</label><input style={C.inp} type="text" placeholder="وصف النفقة" value={finDesc} onChange={e => setFinDesc(e.target.value)} /></div>
              <div><label style={C.lbl}>المبلغ (₪)</label><input style={C.inp} type="number" placeholder="0" value={finAmt} onChange={e => setFinAmt(e.target.value)} /></div>
              <button style={C.btnN({ marginTop: 8 })} onClick={addExpense}>تسجيل الصرف</button>
            </div>
          </div>
          <div style={C.card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }} className="no-print">
              <h3 style={{ ...C.h3, marginBottom: 0 }}>📊 سجل المعاملات المالية</h3>
              <button onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #ccff00, #aadd00)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '13px', fontFamily: "'Cairo', sans-serif" }}>🖨️ طباعة</button>
            </div>
            {finance.length === 0 ? <p style={{ color: '#444', textAlign: 'center', fontFamily: "'Cairo', sans-serif", padding: '30px' }}>لا توجد معاملات بعد</p> :
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                  <thead><tr>{['التاريخ', 'البيان', 'المبلغ', 'النوع'].map(h => <th key={h} style={{ color: '#555', textAlign: 'right', padding: '8px', fontFamily: "'Cairo', sans-serif", fontSize: '12px' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[...finance].reverse().map((x, i) => (
                      <tr key={i}>
                        <td style={{ background: '#0e0e0e', padding: '10px', borderRadius: '0 8px 8px 0', fontSize: '11px', fontFamily: "'Cairo', sans-serif", color: '#666' }}>{x.date}</td>
                        <td style={{ background: '#0e0e0e', padding: '10px', fontFamily: "'Cairo', sans-serif" }}>{x.desc}</td>
                        <td style={{ background: '#0e0e0e', padding: '10px', color: x.type === 'in' ? '#00ff88' : '#ff3333', fontWeight: 900, fontFamily: "'Orbitron', monospace", fontSize: '13px' }}>{x.amt} ₪</td>
                        <td style={{ background: '#0e0e0e', padding: '10px', borderRadius: '8px 0 0 8px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', background: x.type === 'in' ? 'rgba(0,255,136,0.12)' : 'rgba(255,51,51,0.12)', color: x.type === 'in' ? '#00ff88' : '#ff3333', fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>
                            {x.type === 'in' ? 'دخل' : 'صرف'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        {/* ===== OFFERS ===== */}
        <div style={secStyle('off')} className="section-animate">
          <div style={C.card()}>
            <h3 style={C.h3}>🎁 إدارة عروض النادي</h3>
            <div style={C.g3}>
              <div><label style={C.lbl}>اسم العرض</label><input style={C.inp} type="text" placeholder="اسم الباقة" value={offName} onChange={e => setOffName(e.target.value)} /></div>
              <div><label style={C.lbl}>السعر (₪)</label><input style={C.inp} type="number" placeholder="0" value={offPrice} onChange={e => setOffPrice(e.target.value)} /></div>
              <div><label style={C.lbl}>عدد الجلسات</label><input style={C.inp} type="number" placeholder="0" value={offSess} onChange={e => setOffSess(e.target.value)} /></div>
            </div>
            <button style={C.btnN()} onClick={addNewOffer}>➕ إضافة عرض جديد</button>
          </div>
          <div style={C.g3}>
            {offers.map(o => (
              <div key={o.id} style={{ ...C.card({ textAlign: 'center', position: 'relative' }), border: '1px solid rgba(204,255,0,0.2)', background: 'linear-gradient(145deg, #0a0a0a, #111)' }}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#ccff00', fontFamily: "'Orbitron', monospace" }}>EMS</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', fontFamily: "'Cairo', sans-serif", marginBottom: '8px', marginTop: '10px' }}>{o.name}</div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#ccff00', fontFamily: "'Orbitron', monospace" }}>{o.price}</div>
                <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>شيقل</div>
                <div style={{ display: 'inline-block', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: '20px', padding: '4px 16px', color: '#00e5ff', fontSize: '13px', fontFamily: "'Cairo', sans-serif", marginBottom: '16px' }}>
                  {o.sess} جلسة EMS
                </div>
                <button onClick={() => deleteOffer(o.id)} style={{ display: 'block', width: '100%', background: 'rgba(255,51,51,0.1)', color: '#ff3333', border: '1px solid rgba(255,51,51,0.3)', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>حذف</button>
              </div>
            ))}
          </div>
        </div>

        {/* ===== PORTFOLIO ===== */}
        <div style={secStyle('port')} className="section-animate">
          <div style={C.card()} className="no-print">
            <h3 style={C.h3}>📂 بوابة الملف الشامل للمشترك</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={C.lbl}>اختر المشترك</label>
                <select style={C.inp} value={portMemberId} onChange={e => setPortMemberId(e.target.value)}>
                  <option value="">-- اختر مشترك --</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              {portMember && (
                <button onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #ccff00, #aadd00)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontFamily: "'Cairo', sans-serif", whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(204,255,0,0.3)' }}>
                  🖨️ طباعة الملف
                </button>
              )}
            </div>
          </div>

          {portMember && (
            <div className="print-zone" style={{ background: '#fff', color: '#000', borderRadius: '20px', overflow: 'hidden', padding: '40px', border: '2px solid #eee', direction: 'rtl' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '4px solid #ccff00', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <img src={logoImg} alt="Logo" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ccff00' }} />
                  <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontFamily: "'Orbitron', monospace", color: '#000' }}>SMART SPORT LAND</h1>
                    <p style={{ margin: '4px 0 0', color: '#666', fontSize: '12px', fontFamily: "'Orbitron', monospace", letterSpacing: '2px' }}>EMS TRAINING · NABLUS · PALESTINE</p>
                  </div>
                </div>
                <img src={portMember.img || logoImg} style={{ width: '120px', height: '120px', borderRadius: '15px', objectFit: 'cover', border: '3px solid #000' }} alt="" />
              </div>

              {/* Member info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>اسم المشترك:</b> {portMember.name}</p>
                  <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>الهدف:</b> {portMember.goal}</p>
                  <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>المدرب:</b> {portMember.coach}</p>
                  {portMember.chronic && <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>أمراض مزمنة:</b> {portMember.chronic}</p>}
                  {portMember.bone && <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>إصابات هيكلية:</b> {portMember.bone}</p>}
                  <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif", color: '#666', fontSize: '12px' }}><b>تاريخ التسجيل:</b> {portMember.date}</p>
                </div>
                <div style={{ background: '#f8f8f8', padding: '16px', borderRadius: '12px', border: '1px solid #eee' }}>
                  <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>الجلسات المتبقية:</b> <span style={{ color: '#00e5ff', fontWeight: 900, fontSize: '18px' }}>{portMember.rem_sess}</span></p>
                  <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>الدين المتبقي:</b> <span style={{ color: '#ff3333', fontWeight: 900, fontSize: '18px' }}>{portMember.debt} ₪</span></p>
                  <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>المدفوع:</b> {portMember.paid} ₪</p>
                  <p style={{ margin: '6px 0', fontFamily: "'Cairo', sans-serif" }}><b>إجمالي الباقة:</b> {portMember.total} ₪</p>
                </div>
              </div>

              {/* Measurements */}
              <hr style={{ border: '1px solid #eee', margin: '20px 0' }} />
              <h3 style={{ color: '#000', borderRight: '5px solid #ccff00', paddingRight: '10px', fontFamily: "'Cairo', sans-serif" }}>📏 أحدث القياسات</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { l: 'الوزن', v: portMember.lab.w ? portMember.lab.w + ' كغم' : '-' },
                  { l: 'الطول', v: portMember.lab.h ? portMember.lab.h + ' سم' : '-' },
                  { l: 'الخصر', v: portMember.lab.waist ? portMember.lab.waist + ' سم' : '-' },
                  { l: 'الصدر', v: portMember.lab.chest ? portMember.lab.chest + ' سم' : '-' },
                  { l: 'الأرداف', v: portMember.lab.hips ? portMember.lab.hips + ' سم' : '-' },
                  { l: 'الدهون', v: portMember.lab.fat || '-' },
                  { l: 'BMI', v: portMember.lab.bmi || '-' },
                  { l: 'العضل', v: portMember.lab.mus || '-' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#888', fontFamily: "'Cairo', sans-serif" }}>{item.l}</div>
                    <div style={{ fontWeight: 'bold', marginTop: '4px', fontFamily: "'Cairo', sans-serif" }}>{item.v}</div>
                  </div>
                ))}
              </div>

              {/* History */}
              {portMember.history && portMember.history.length > 0 && (
                <>
                  <hr style={{ border: '1px solid #eee', margin: '20px 0' }} />
                  <h3 style={{ color: '#000', borderRight: '5px solid #ccff00', paddingRight: '10px', fontFamily: "'Cairo', sans-serif" }}>📜 سجل التطور</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f0f0f0' }}>
                        {['التاريخ', 'الوزن', 'الخصر', 'الدهون', 'BMI'].map(h => <th key={h} style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd', fontFamily: "'Cairo', sans-serif" }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[...portMember.history].reverse().map((h, i) => (
                        <tr key={i}>
                          {[h.date, h.w, h.waist, h.fat, h.bmi].map((v, j) => <td key={j} style={{ padding: '8px', border: '1px solid #eee', fontFamily: "'Cairo', sans-serif" }}>{v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Plans */}
              <hr style={{ border: '1px solid #eee', margin: '20px 0' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ fontFamily: "'Cairo', sans-serif", borderRight: '3px solid #00ff88', paddingRight: '8px' }}>🥗 نظام التغذية</h4>
                  <p style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: '15px', borderRadius: '10px', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>
                    {portMember.diet || 'لم يتم تحديد خطة بعد'}
                  </p>
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Cairo', sans-serif", borderRight: '3px solid #00e5ff', paddingRight: '8px' }}>⚡ خطة EMS</h4>
                  <p style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: '15px', borderRadius: '10px', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>
                    {portMember.train || 'لم يتم تحديد خطة بعد'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: '24px', borderTop: '2px solid #ccff00', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: '#999', fontFamily: "'Orbitron', monospace" }}>SMART SPORT LAND © 2025</div>
                <div style={{ fontSize: '11px', color: '#999', fontFamily: "'Cairo', sans-serif" }}>نابلس، فلسطين</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ===== TOAST ===== */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #ccff00, #aadd00)', color: '#000', padding: '14px 28px', borderRadius: '30px', fontWeight: 900, zIndex: 9999, boxShadow: '0 8px 30px rgba(204,255,0,0.5)', fontSize: '14px', fontFamily: "'Cairo', sans-serif", whiteSpace: 'nowrap', direction: 'rtl' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
