import { useState, useEffect, useRef, useCallback } from "react";

type Section = 'dash' | 'reg' | 'lab' | 'prog' | 'book' | 'staff' | 'fin' | 'off' | 'port';

interface LabData {
  h: string; w: string; age?: string;
  chest: string; waist: string; hips: string;
  thighR: string; thighL: string; armR: string; armL: string;
  bmi?: string; fat?: string; mus?: string;
}

interface HistoryEntry extends LabData {
  date: string;
}

interface Member {
  id: number;
  name: string;
  addr: string;
  goal: string;
  chronic: string;
  bone: string;
  total: number;
  paid: number;
  debt: number;
  rem_sess: number;
  coach: string;
  img: string;
  lab: LabData;
  history: HistoryEntry[];
  diet: string;
  train: string;
  date: string;
}

interface Staff {
  id: number;
  name: string;
  salary: number;
  task: string;
  loans: number;
}

interface Offer {
  id: number;
  name: string;
  price: number;
  sess: number;
}

interface Finance {
  date: string;
  desc: string;
  amt: number;
  type: 'in' | 'out';
}

interface Booking {
  mName: string;
  time: string;
  suitId: number;
  suitSize: string;
}

interface Suit {
  id: number;
  size: string;
  status: 'avail' | 'booked' | 'broken';
}

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
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function saveToLS(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

const s = {
  container: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#050505' } as React.CSSProperties,
  sidebar: { width: '280px', background: '#000', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' as const, padding: '20px', overflowY: 'auto' as const, flexShrink: 0 },
  logo: { textAlign: 'center' as const, color: '#ccff00', fontSize: '1.6rem', fontWeight: 900, borderBottom: '3px solid #ccff00', paddingBottom: '10px', marginBottom: '20px' },
  menuBtn: (active: boolean): React.CSSProperties => ({ padding: '14px', marginBottom: '8px', borderRadius: '12px', cursor: 'pointer', color: active ? '#ccff00' : '#777', fontWeight: 'bold', border: `1px solid ${active ? '#ccff00' : 'transparent'}`, textAlign: 'right' as const, background: active ? '#1a1a1a' : 'none', width: '100%', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', direction: 'rtl' }),
  main: { flex: 1, overflowY: 'auto' as const, padding: '30px', background: 'radial-gradient(circle at top right, #181818, #050505)' },
  card: (extra?: React.CSSProperties): React.CSSProperties => ({ background: '#121212', border: '1px solid #222', padding: '25px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', ...extra }),
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' } as React.CSSProperties,
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' } as React.CSSProperties,
  input: { background: '#000', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '10px', width: '100%', marginTop: '8px', outline: 'none', fontSize: '14px' } as React.CSSProperties,
  label: { color: '#777', fontSize: '13px' } as React.CSSProperties,
  btnNeon: (extra?: React.CSSProperties): React.CSSProperties => ({ background: '#ccff00', color: '#000', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', width: '100%', marginTop: '15px', fontSize: '16px', ...extra }),
  btnAccent: (extra?: React.CSSProperties): React.CSSProperties => ({ background: '#00e5ff', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', width: '100%', marginTop: '15px', fontSize: '14px', ...extra }),
  h3: { color: '#fff', marginTop: 0, marginBottom: '20px' } as React.CSSProperties,
  h4Neon: { color: '#ccff00', marginTop: '25px', borderBottom: '1px solid #333', paddingBottom: '5px' } as React.CSSProperties,
  h4Accent: { color: '#00e5ff', marginTop: '25px', borderBottom: '1px solid #333', paddingBottom: '5px' } as React.CSSProperties,
};

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('dash');
  const [members, setMembers] = useState<Member[]>(() => loadFromLS('sl_m_v4', []));
  const [staff, setStaff] = useState<Staff[]>(() => loadFromLS('sl_s_v4', []));
  const [offers, setOffers] = useState<Offer[]>(() => loadFromLS('sl_o_v4', DEFAULT_OFFERS));
  const [finance, setFinance] = useState<Finance[]>(() => loadFromLS('sl_f_v4', []));
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromLS('sl_b_v4', []));
  const [suits, setSuits] = useState<Suit[]>(() => loadFromLS('sl_suits_v4', DEFAULT_SUITS));

  const [toast, setToast] = useState('');

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

  // Lab form
  const [labMemberId, setLabMemberId] = useState('');
  const [labData, setLabData] = useState<LabData>(EMPTY_LAB);
  const [labAge, setLabAge] = useState('');

  // Prog form
  const [progMemberId, setProgMemberId] = useState('');
  const [diet, setDiet] = useState('');
  const [train, setTrain] = useState('');

  // Booking
  const [bookMemberId, setBookMemberId] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookSuitId, setBookSuitId] = useState('');

  // Staff form
  const [staffName, setStaffName] = useState('');
  const [staffSalary, setStaffSalary] = useState('');
  const [staffTask, setStaffTask] = useState('');

  // Finance
  const [finDesc, setFinDesc] = useState('');
  const [finAmt, setFinAmt] = useState('');

  // Offers
  const [offName, setOffName] = useState('');
  const [offPrice, setOffPrice] = useState('');
  const [offSess, setOffSess] = useState('');

  // Portfolio
  const [portMemberId, setPortMemberId] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  useEffect(() => { saveToLS('sl_m_v4', members); }, [members]);
  useEffect(() => { saveToLS('sl_s_v4', staff); }, [staff]);
  useEffect(() => { saveToLS('sl_o_v4', offers); }, [offers]);
  useEffect(() => { saveToLS('sl_f_v4', finance); }, [finance]);
  useEffect(() => { saveToLS('sl_b_v4', bookings); }, [bookings]);
  useEffect(() => { saveToLS('sl_suits_v4', suits); }, [suits]);

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

  function calcAI(data: LabData): { bmi: string; fat: string; mus: string } {
    const h = parseFloat(data.h) / 100;
    const w = parseFloat(data.w);
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
    if (m) {
      setLabData({ ...EMPTY_LAB, ...m.lab });
      setLabAge(m.lab.age || '');
    } else {
      setLabData(EMPTY_LAB);
    }
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

  const menuItems: { id: Section; label: string }[] = [
    { id: 'dash', label: '📊 الرادار (المتابعة الذكية)' },
    { id: 'reg', label: '👤 تسجيل عضو جديد' },
    { id: 'lab', label: '🔬 قياسات المشترك AI' },
    { id: 'prog', label: '🍎 خطة الغذاء والتدريب' },
    { id: 'book', label: '📅 الحجز والمخزون' },
    { id: 'staff', label: '👔 الموظفين والمهام' },
    { id: 'fin', label: '💰 التقارير المالية' },
    { id: 'off', label: '🎁 إدارة العروض' },
    { id: 'port', label: '📂 الملف الشامل' },
  ];

  const sectionStyle = (id: Section): React.CSSProperties => ({
    display: activeSection === id ? 'block' : 'none',
  });

  return (
    <div style={s.container}>
      {/* Sidebar */}
      <div style={s.sidebar} className="no-print">
        <div style={s.logo}>SPORT LAND</div>
        {menuItems.map(item => (
          <button key={item.id} style={s.menuBtn(activeSection === item.id)} onClick={() => setActiveSection(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={s.main}>

        {/* DASHBOARD */}
        <div style={sectionStyle('dash')} className="section-animate">
          <div style={s.grid3}>
            <div style={s.card({ borderTop: '5px solid #ff3333' })}>
              <h3 style={{ ...s.h3, color: '#ff3333' }}>💸 ديون المشتركين</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {members.filter(x => x.debt > 0).length === 0
                  ? <p style={{ color: '#777' }}>لا ديون</p>
                  : members.filter(x => x.debt > 0).map(x => (
                    <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #222' }}>
                      <span>{x.name}</span>
                      <span style={{ color: '#ff3333' }}>{x.debt} ₪</span>
                    </div>
                  ))}
              </div>
            </div>
            <div style={s.card({ borderTop: '5px solid #00e5ff' })}>
              <h3 style={{ ...s.h3, color: '#00e5ff' }}>📅 الحجوزات المسجلة</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {bookings.length === 0
                  ? <p style={{ color: '#777' }}>لا حجوزات</p>
                  : [...bookings].reverse().slice(0, 8).map((x, i) => (
                    <div key={i} style={{ padding: '8px', background: '#1a1a1a', marginBottom: '5px', borderRight: '3px solid #00e5ff', fontSize: '12px' }}>
                      {x.mName} | {x.time.replace('T', ' ')} | بدلة {x.suitId}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div style={s.card()}>
            <h3 style={s.h3}>📟 حالة أجهزة EMS الـ 10 (اضغط لتغيير الحالة)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {suits.map(suit => {
                const colors = { avail: '#00ff88', booked: '#00e5ff', broken: '#ff3333' };
                const color = colors[suit.status];
                return (
                  <div key={suit.id} onClick={() => toggleSuit(suit.id)} style={{ padding: '15px', borderRadius: '12px', border: `1px solid ${color}`, textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', color, background: `${color}11`, opacity: suit.status === 'broken' ? 0.6 : 1 }}>
                    <div style={{ fontSize: '18px' }}>{suit.size}</div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>
                      {suit.status === 'avail' ? 'متاح' : suit.status === 'booked' ? 'محجوز' : 'معطل'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* REGISTRATION */}
        <div style={sectionStyle('reg')} className="section-animate">
          <div style={s.card()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div onClick={() => imgInputRef.current?.click()} style={{ width: '130px', height: '130px', borderRadius: '50%', border: regImg ? '3px solid #ccff00' : '3px dashed #ccff00', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: '#000' }}>
                {regImg ? <img src={regImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ color: '#777' }}>صورة المشترك</span>}
              </div>
              <input ref={imgInputRef} type="file" accept="image/*" hidden onChange={handleRegImg} />
            </div>
            <div style={s.grid3}>
              <div>
                <label style={s.label}>الاسم الكامل</label>
                <input style={s.input} type="text" placeholder="الاسم الرباعي" value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>السكن / الهاتف</label>
                <input style={s.input} type="text" placeholder="العنوان ورقم التواصل" value={regAddr} onChange={e => setRegAddr(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>الهدف الرئيسي</label>
                <select style={s.input} value={regGoal} onChange={e => setRegGoal(e.target.value)}>
                  <option>تنشيف دهون</option>
                  <option>تضخيم عضلي</option>
                  <option>لياقة بدنية</option>
                  <option>علاجي / إصابات</option>
                </select>
              </div>
            </div>
            <div style={{ ...s.grid3, marginTop: '15px' }}>
              <div>
                <label style={s.label}>أمراض مزمنة</label>
                <input style={s.input} type="text" placeholder="سكري، ضغط، قلب..." value={regChronic} onChange={e => setRegChronic(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>إصابات هيكلية</label>
                <input style={s.input} type="text" placeholder="ديسك، مفاصل، كسور..." value={regBone} onChange={e => setRegBone(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>اختيار الباقة</label>
                <select style={s.input} value={regOfferId ?? ''} onChange={e => setRegOfferId(Number(e.target.value))}>
                  {offers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.price} ₪ / {o.sess} جلسة)</option>)}
                </select>
              </div>
            </div>
            <div style={{ ...s.grid3, marginTop: '15px' }}>
              <div>
                <label style={s.label}>المبلغ المدفوع (₪)</label>
                <input style={s.input} type="number" value={regPaid} onChange={e => setRegPaid(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>الدين المتبقي (₪)</label>
                <input style={{ ...s.input, color: '#ff3333', fontWeight: 'bold' }} type="text" readOnly value={`${regDebt} ₪`} />
              </div>
              <div>
                <label style={s.label}>المدرب المباشر</label>
                <select style={s.input} value={regCoach} onChange={e => setRegCoach(e.target.value)}>
                  {staff.length === 0 ? <option>لا يوجد مدربين</option> : staff.map(s => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <button style={s.btnNeon()} onClick={saveNewMember}>تثبيت الإشتراك بنجاح ✅</button>
          </div>
        </div>

        {/* LAB */}
        <div style={sectionStyle('lab')} className="section-animate">
          <div style={s.card()}>
            <h3 style={s.h3}>🔬 تتبع القياسات الحيوية والبدنية AI</h3>
            <select style={s.input} value={labMemberId} onChange={e => loadMemberLab(e.target.value)}>
              <option value="">-- اختر مشترك --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <h4 style={s.h4Neon}>📏 القياسات الأساسية</h4>
            <div style={s.grid3}>
              <input style={s.input} type="number" placeholder="الطول (سم)" value={labData.h} onChange={e => setLabData(p => ({ ...p, h: e.target.value }))} />
              <input style={s.input} type="number" placeholder="الوزن (كغم)" value={labData.w} onChange={e => setLabData(p => ({ ...p, w: e.target.value }))} />
              <input style={s.input} type="number" placeholder="العمر" value={labAge} onChange={e => setLabAge(e.target.value)} />
            </div>
            <h4 style={s.h4Accent}>📐 قياسات محيط الجسم (سم)</h4>
            <div style={s.grid4}>
              {[
                { label: 'الصدر', field: 'chest' as keyof LabData },
                { label: 'الخصر', field: 'waist' as keyof LabData },
                { label: 'الأرداف', field: 'hips' as keyof LabData },
                { label: 'الفخذ (يمين)', field: 'thighR' as keyof LabData },
                { label: 'الفخذ (يسار)', field: 'thighL' as keyof LabData },
                { label: 'الذراع (يمين)', field: 'armR' as keyof LabData },
                { label: 'الذراع (يسار)', field: 'armL' as keyof LabData },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label style={s.label}>{label}</label>
                  <input style={s.input} type="number" placeholder="0" value={labData[field] || ''} onChange={e => setLabData(p => ({ ...p, [field]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ ...s.grid3, marginTop: '20px', textAlign: 'center' }}>
              <div style={s.card({ textAlign: 'center' })}>
                <div style={{ color: '#777', fontSize: '13px' }}>BMI</div>
                <h2 style={{ color: '#ccff00', margin: '10px 0 0' }}>{aiStats.bmi}</h2>
              </div>
              <div style={s.card({ textAlign: 'center' })}>
                <div style={{ color: '#777', fontSize: '13px' }}>الدهون %</div>
                <h2 style={{ color: '#ff3333', margin: '10px 0 0' }}>{aiStats.fat}</h2>
              </div>
              <div style={s.card({ textAlign: 'center' })}>
                <div style={{ color: '#777', fontSize: '13px' }}>العضل %</div>
                <h2 style={{ color: '#00ff88', margin: '10px 0 0' }}>{aiStats.mus}</h2>
              </div>
            </div>
            <button style={s.btnNeon()} onClick={saveMemberLab}>حفظ القياسات التفصيلية وتحديث السجل</button>
            {labMemberId && (() => {
              const m = members.find(x => String(x.id) === labMemberId);
              if (!m || !m.history || m.history.length === 0) return null;
              return (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: '#fff' }}>📜 سجل التطور التاريخي</h4>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        {['التاريخ', 'الوزن', 'الخصر', 'الدهون', 'BMI'].map(h => (
                          <th key={h} style={{ color: '#777', textAlign: 'right', padding: '8px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...m.history].reverse().map((h, i) => (
                        <tr key={i}>
                          {[h.date, h.w, h.waist, h.fat, h.bmi].map((v, j) => (
                            <td key={j} style={{ background: '#1a1a1a', padding: '10px', borderRadius: j === 0 ? '0 8px 8px 0' : j === 4 ? '8px 0 0 8px' : undefined }}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>

        {/* PROGRAM */}
        <div style={sectionStyle('prog')} className="section-animate">
          <div style={s.card()}>
            <h3 style={s.h3}>🍎 تفاصيل خطة التغذية والتدريب</h3>
            <select style={s.input} value={progMemberId} onChange={e => loadMemberProg(e.target.value)}>
              <option value="">-- اختر مشترك --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button style={s.btnAccent()} onClick={generateSmartProg}>توليد الخطة الذكية ✨</button>
            <div style={{ ...s.grid3, marginTop: '20px' }}>
              <div>
                <label style={s.label}>🥗 نظام التغذية (وجبة بوجبة)</label>
                <textarea style={{ ...s.input, height: '350px', resize: 'vertical' }} value={diet} onChange={e => setDiet(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>⚡ خطة تدريب EMS (الترددات)</label>
                <textarea style={{ ...s.input, height: '350px', resize: 'vertical' }} value={train} onChange={e => setTrain(e.target.value)} />
              </div>
            </div>
            <button style={s.btnNeon()} onClick={saveMemberProg}>حفظ وتحديث الخطة</button>
          </div>
        </div>

        {/* BOOKING */}
        <div style={sectionStyle('book')} className="section-animate">
          <div style={s.card()}>
            <h3 style={s.h3}>📅 حجز جلسة ذكي (تتبع البدلات)</h3>
            <div style={s.grid3}>
              <div>
                <label style={s.label}>المشترك</label>
                <select style={s.input} value={bookMemberId} onChange={e => setBookMemberId(e.target.value)}>
                  <option value="">-- اختر مشترك --</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {bookMember && <div style={{ marginTop: '10px', color: '#ccff00', fontSize: '13px' }}>الجلسات المتبقية: {bookMember.rem_sess}</div>}
              </div>
              <div>
                <label style={s.label}>وقت الحجز</label>
                <input style={s.input} type="datetime-local" value={bookDate} onChange={e => setBookDate(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>البدلة المتوفرة</label>
                <select style={s.input} value={bookSuitId} onChange={e => setBookSuitId(e.target.value)}>
                  <option value="">-- اختر بدلة --</option>
                  {availSuits.map(s => <option key={s.id} value={s.id}>بدلة {s.id} [{s.size}]</option>)}
                </select>
              </div>
            </div>
            <button style={s.btnNeon()} onClick={confirmBooking}>تثبيت الموعد وخصم جلسة ✅</button>
          </div>
          <div style={s.card()}>
            <h3 style={s.h3}>📋 سجل الحجوزات</h3>
            {bookings.length === 0 ? <p style={{ color: '#777' }}>لا توجد حجوزات بعد</p> :
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>{['المشترك', 'الوقت', 'البدلة'].map(h => <th key={h} style={{ color: '#777', textAlign: 'right', padding: '8px' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[...bookings].reverse().map((b, i) => (
                    <tr key={i}>
                      <td style={{ background: '#1a1a1a', padding: '10px', borderRadius: '0 8px 8px 0' }}>{b.mName}</td>
                      <td style={{ background: '#1a1a1a', padding: '10px' }}>{b.time.replace('T', ' ')}</td>
                      <td style={{ background: '#1a1a1a', padding: '10px', borderRadius: '8px 0 0 8px' }}>بدلة {b.suitId} [{b.suitSize}]</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </div>

        {/* STAFF */}
        <div style={sectionStyle('staff')} className="section-animate">
          <div style={s.card()}>
            <h3 style={s.h3}>👔 إدارة الطاقم والمهام</h3>
            <div style={s.grid3}>
              <input style={s.input} type="text" placeholder="اسم الموظف" value={staffName} onChange={e => setStaffName(e.target.value)} />
              <input style={s.input} type="number" placeholder="الراتب الأساسي" value={staffSalary} onChange={e => setStaffSalary(e.target.value)} />
              <input style={s.input} type="text" placeholder="المهمة الوظيفية" value={staffTask} onChange={e => setStaffTask(e.target.value)} />
            </div>
            <button style={s.btnNeon()} onClick={addNewStaff}>إضافة موظف</button>
            {staff.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', marginTop: '20px' }}>
                <thead>
                  <tr>{['الموظف', 'المهمة', 'الراتب', 'السلف', 'الصافي', 'إجراء'].map(h => <th key={h} style={{ color: '#777', textAlign: 'right', padding: '8px' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {staff.map(x => (
                    <tr key={x.id}>
                      <td style={{ background: '#1a1a1a', padding: '12px', borderRadius: '0 8px 8px 0' }}>{x.name}</td>
                      <td style={{ background: '#1a1a1a', padding: '12px' }}>{x.task}</td>
                      <td style={{ background: '#1a1a1a', padding: '12px' }}>{x.salary} ₪</td>
                      <td style={{ background: '#1a1a1a', padding: '12px', color: '#ff3333' }}>{x.loans} ₪</td>
                      <td style={{ background: '#1a1a1a', padding: '12px', color: '#00ff88' }}>{x.salary - x.loans} ₪</td>
                      <td style={{ background: '#1a1a1a', padding: '12px', borderRadius: '8px 0 0 8px' }}>
                        <button onClick={() => addLoan(x.id)} style={{ background: '#ff3333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>سلفة</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* FINANCE */}
        <div style={sectionStyle('fin')} className="section-animate">
          <div style={s.grid3} className="no-print">
            <div style={s.card({ textAlign: 'center' })}>
              <div style={{ color: '#777' }}>إجمالي الدخل</div>
              <h2 style={{ color: '#00ff88', margin: '10px 0 0' }}>{finIncome.toFixed(2)} ₪</h2>
            </div>
            <div style={s.card({ textAlign: 'center' })}>
              <div style={{ color: '#777' }}>إجمالي الصرف</div>
              <h2 style={{ color: '#ff3333', margin: '10px 0 0' }}>{finExpense.toFixed(2)} ₪</h2>
            </div>
            <div style={s.card({ textAlign: 'center' })}>
              <div style={{ color: '#777' }}>الربح الفعلي</div>
              <h2 style={{ color: '#ccff00', margin: '10px 0 0' }}>{finNet.toFixed(2)} ₪</h2>
            </div>
          </div>
          <div style={s.card()} className="no-print">
            <h3 style={s.h3}>💸 تسجيل نفقات إضافية</h3>
            <div style={s.grid3}>
              <input style={s.input} type="text" placeholder="البيان" value={finDesc} onChange={e => setFinDesc(e.target.value)} />
              <input style={s.input} type="number" placeholder="المبلغ" value={finAmt} onChange={e => setFinAmt(e.target.value)} />
              <button style={s.btnNeon({ marginTop: 8 })} onClick={addExpense}>تسجيل الصرف</button>
            </div>
          </div>
          <div style={s.card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }} className="no-print">
              <h3 style={{ ...s.h3, marginBottom: 0 }}>📊 سجل المعاملات المالية التفصيلي</h3>
              <button onClick={() => window.print()} style={{ background: '#ccff00', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', fontSize: '13px' }}>🖨️ طباعة التقرير</button>
            </div>
            {finance.length === 0 ? <p style={{ color: '#777' }}>لا توجد معاملات بعد</p> :
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>{['التاريخ', 'البيان', 'المبلغ', 'النوع'].map(h => <th key={h} style={{ color: '#777', textAlign: 'right', padding: '8px' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[...finance].reverse().map((x, i) => (
                    <tr key={i}>
                      <td style={{ background: '#1a1a1a', padding: '10px', borderRadius: '0 8px 8px 0', fontSize: '12px' }}>{x.date}</td>
                      <td style={{ background: '#1a1a1a', padding: '10px', fontSize: '12px' }}>{x.desc}</td>
                      <td style={{ background: '#1a1a1a', padding: '10px', color: x.type === 'in' ? '#00ff88' : '#ff3333', fontWeight: 'bold' }}>{x.amt} ₪</td>
                      <td style={{ background: '#1a1a1a', padding: '10px', borderRadius: '8px 0 0 8px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: x.type === 'in' ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,51,0.15)', color: x.type === 'in' ? '#00ff88' : '#ff3333' }}>
                          {x.type === 'in' ? 'دخل' : 'صرف'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </div>

        {/* OFFERS */}
        <div style={sectionStyle('off')} className="section-animate">
          <div style={s.card()}>
            <h3 style={s.h3}>🎁 إدارة عروض النادي</h3>
            <div style={s.grid3}>
              <input style={s.input} type="text" placeholder="اسم العرض" value={offName} onChange={e => setOffName(e.target.value)} />
              <input style={s.input} type="number" placeholder="السعر (₪)" value={offPrice} onChange={e => setOffPrice(e.target.value)} />
              <input style={s.input} type="number" placeholder="عدد الجلسات" value={offSess} onChange={e => setOffSess(e.target.value)} />
            </div>
            <button style={s.btnNeon()} onClick={addNewOffer}>إضافة عرض جديد</button>
          </div>
          <div style={s.grid3}>
            {offers.map(o => (
              <div key={o.id} style={s.card({ textAlign: 'center', position: 'relative' })}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ccff00', marginBottom: '10px' }}>{o.name}</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{o.price} ₪</div>
                <div style={{ color: '#777', marginTop: '5px' }}>{o.sess} جلسة</div>
                <button onClick={() => deleteOffer(o.id)} style={{ background: '#ff3333', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' }}>حذف</button>
              </div>
            ))}
          </div>
        </div>

        {/* PORTFOLIO */}
        <div style={sectionStyle('port')} className="section-animate">
          <div style={s.card()} className="no-print">
            <h3 style={s.h3}>📂 بوابة الملف الشامل للمشترك</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <select style={{ ...s.input, flex: 1 }} value={portMemberId} onChange={e => setPortMemberId(e.target.value)}>
                <option value="">-- اختر مشترك --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {portMember && (
                <button onClick={() => window.print()} style={{ background: '#ccff00', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}>🖨️ طباعة الملف</button>
              )}
            </div>
          </div>
          {portMember && (
            <div className="print-zone" style={{ background: '#fff', color: '#000', borderRadius: '15px', overflow: 'hidden', padding: '40px', border: '2px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '4px solid #ccff00', paddingBottom: '20px' }}>
                <img src={portMember.img || 'https://via.placeholder.com/150'} style={{ width: '140px', height: '140px', borderRadius: '15px', objectFit: 'cover', border: '3px solid #000' }} alt="" />
                <div style={{ textAlign: 'left' }}>
                  <h1 style={{ margin: 0, fontSize: '28px' }}>SPORT LAND GYM</h1>
                  <p style={{ margin: '5px 0', color: '#555' }}>ملف عضوية ملكي الشامل</p>
                  <p style={{ margin: '5px 0', color: '#555', fontSize: '13px' }}>تاريخ التسجيل: {portMember.date}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '16px' }}>
                <div>
                  <p><b>اسم المشترك:</b> {portMember.name}</p>
                  <p><b>الهدف:</b> {portMember.goal}</p>
                  <p><b>المدرب:</b> {portMember.coach}</p>
                  {portMember.chronic && <p><b>أمراض مزمنة:</b> {portMember.chronic}</p>}
                  {portMember.bone && <p><b>إصابات هيكلية:</b> {portMember.bone}</p>}
                </div>
                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px' }}>
                  <p><b>الجلسات المتبقية:</b> <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{portMember.rem_sess}</span></p>
                  <p><b>الدين المتبقي:</b> <span style={{ color: '#ff3333', fontWeight: 'bold' }}>{portMember.debt} ₪</span></p>
                  <p><b>المبلغ المدفوع:</b> {portMember.paid} ₪</p>
                  <p><b>إجمالي الباقة:</b> {portMember.total} ₪</p>
                </div>
              </div>
              <hr style={{ border: '1px solid #eee', margin: '25px 0' }} />
              <h3 style={{ color: '#000', borderRight: '5px solid #ccff00', paddingRight: '10px' }}>📏 أحدث القياسات (التحليل البدني)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                {[
                  { label: 'الوزن', val: portMember.lab.w ? `${portMember.lab.w} كغم` : '-' },
                  { label: 'الطول', val: portMember.lab.h ? `${portMember.lab.h} سم` : '-' },
                  { label: 'الخصر', val: portMember.lab.waist ? `${portMember.lab.waist} سم` : '-' },
                  { label: 'الصدر', val: portMember.lab.chest ? `${portMember.lab.chest} سم` : '-' },
                  { label: 'الأرداف', val: portMember.lab.hips ? `${portMember.lab.hips} سم` : '-' },
                  { label: 'الدهون', val: portMember.lab.fat || '-' },
                  { label: 'BMI', val: portMember.lab.bmi || '-' },
                  { label: 'العضل', val: portMember.lab.mus || '-' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#eee', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#666' }}>{item.label}</div>
                    <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{item.val}</div>
                  </div>
                ))}
              </div>
              {(portMember.history && portMember.history.length > 0) && (
                <>
                  <hr style={{ border: '1px solid #eee', margin: '25px 0' }} />
                  <h3 style={{ color: '#000', borderRight: '5px solid #ccff00', paddingRight: '10px' }}>📜 سجل التطور</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        {['التاريخ', 'الوزن', 'الخصر', 'الدهون', 'BMI'].map(h => <th key={h} style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[...portMember.history].reverse().map((h, i) => (
                        <tr key={i}>
                          {[h.date, h.w, h.waist, h.fat, h.bmi].map((v, j) => <td key={j} style={{ padding: '8px', border: '1px solid #ddd' }}>{v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              <hr style={{ border: '1px solid #eee', margin: '25px 0' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                  <h4>🥗 نظام التغذية</h4>
                  <p style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '15px', borderRadius: '10px', fontSize: '14px' }}>
                    {portMember.diet || 'لم يتم تحديد خطة بعد'}
                  </p>
                </div>
                <div>
                  <h4>⚡ خطة EMS</h4>
                  <p style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '15px', borderRadius: '10px', fontSize: '14px' }}>
                    {portMember.train || 'لم يتم تحديد خطة بعد'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#ccff00', color: '#000', padding: '14px 28px', borderRadius: '30px', fontWeight: 900, zIndex: 9999, boxShadow: '0 4px 20px rgba(204,255,0,0.5)', fontSize: '15px' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
