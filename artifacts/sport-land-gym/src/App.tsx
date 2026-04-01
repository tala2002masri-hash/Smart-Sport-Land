import { useState, useEffect, useRef, useCallback } from "react";
import logoImg from "/logo.png";
import heroBg from "/hero-bg.png";
import athletesImg from "/athletes.png";

/* ─────────────── TYPES ─────────────── */
type Screen = 'landing' | 'admin';
type Section = 'dash' | 'reg' | 'lab' | 'prog' | 'book' | 'staff' | 'fin' | 'off' | 'port';

interface LabData { h:string;w:string;age?:string;neck:string;chest:string;waist:string;hips:string;thighR:string;thighL:string;armR:string;armL:string;bmi?:string;fat?:string;mus?:string; }
interface HistoryEntry extends LabData { date:string; }
interface ProgressPhoto { img:string; date:string; note:string; }
interface Member { id:number;name:string;addr:string;goal:string;chronic:string;bone:string;total:number;paid:number;debt:number;rem_sess:number;coach:string;img:string;lab:LabData;history:HistoryEntry[];diet:string;train:string;date:string;photos:ProgressPhoto[]; }
interface Staff { id:number;name:string;salary:number;task:string;loans:number; }
interface Offer { id:number;name:string;price:number;sess:number; }
interface Finance { id:number;date:string;desc:string;amt:number;type:'in'|'out';cat:string; }
interface Booking { id:number;mId:number;mName:string;time:string;suitId:number;suitSize:string; }
interface Suit { id:number;size:string;status:'avail'|'booked'|'broken'; }

/* ─────────────── DEFAULTS ─────────────── */
const DEFAULT_SUITS:Suit[] = [
  {id:1,size:'S',status:'avail'},{id:2,size:'S',status:'avail'},
  {id:3,size:'M',status:'avail'},{id:4,size:'M',status:'avail'},
  {id:5,size:'L',status:'avail'},{id:6,size:'L',status:'avail'},
  {id:7,size:'XL',status:'avail'},{id:8,size:'XL',status:'avail'},
  {id:9,size:'XXL',status:'avail'},{id:10,size:'XXL',status:'avail'}
];
const DEFAULT_OFFERS:Offer[] = [{id:1,name:'باقة الافتتاح',price:500,sess:12}];
const EMPTY_LAB:LabData = {h:'',w:'',neck:'',chest:'',waist:'',hips:'',thighR:'',thighL:'',armR:'',armL:''};
const MOTTOS = ['⚡ قوّتك الحقيقية تبدأ من هنا','🔥 اليوم أقوى من أمس','💪 EMS — الذكاء في خدمة جسمك','🎯 كل جلسة خطوة نحو الكمال','🚀 ٢٠ دقيقة تساوي ساعتين تقليديتين','⭐ المثابرة هي سر كل بطل'];
const TODAY = new Date().toISOString().slice(0,10);

function ls<T>(k:string,fb:T):T { try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;} }
function sv(k:string,v:unknown){localStorage.setItem(k,JSON.stringify(v));}

/* ─────────────── SHARED UI ─────────────── */
const ff = "'Cairo', 'Tajawal', sans-serif";
const fo = "'Orbitron', monospace";
const inp:React.CSSProperties = {background:'#080808',border:'1px solid #252525',color:'#fff',padding:'12px 14px',borderRadius:'10px',width:'100%',marginTop:'8px',outline:'none',fontSize:'14px',fontFamily:ff};
const lbl:React.CSSProperties = {color:'#666',fontSize:'12px',fontWeight:600,fontFamily:ff};
const card = (extra?:React.CSSProperties):React.CSSProperties => ({background:'linear-gradient(145deg,#0d0d0d,#131313)',border:'1px solid #1c1c1c',padding:'24px',borderRadius:'18px',marginBottom:'18px',boxShadow:'0 8px 32px rgba(0,0,0,0.6)',...extra});
const g3:React.CSSProperties = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'18px'};
const g4:React.CSSProperties = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'12px'};
const btnN = (extra?:React.CSSProperties):React.CSSProperties => ({background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'14px',borderRadius:'12px',fontWeight:900,cursor:'pointer',width:'100%',marginTop:'14px',fontSize:'15px',fontFamily:ff,boxShadow:'0 4px 18px rgba(204,255,0,0.3)',...extra});
const btnA = (extra?:React.CSSProperties):React.CSSProperties => ({background:'linear-gradient(135deg,#00e5ff,#0099bb)',color:'#000',border:'none',padding:'12px',borderRadius:'12px',fontWeight:900,cursor:'pointer',width:'100%',marginTop:'14px',fontSize:'14px',fontFamily:ff,boxShadow:'0 4px 18px rgba(0,229,255,0.3)',...extra});
const h3s:React.CSSProperties = {color:'#fff',marginTop:0,marginBottom:'18px',fontFamily:ff,fontWeight:700,fontSize:'18px'};
const h4n:React.CSSProperties = {color:'#ccff00',marginTop:'22px',borderBottom:'1px solid #1c1c1c',paddingBottom:'8px',fontFamily:ff,fontWeight:700};
const h4a:React.CSSProperties = {color:'#00e5ff',marginTop:'22px',borderBottom:'1px solid #1c1c1c',paddingBottom:'8px',fontFamily:ff,fontWeight:700};

function Tbl({heads,rows}:{heads:string[];rows:(string|React.ReactNode)[][]}) {
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'separate',borderSpacing:'0 6px'}}>
        <thead><tr>{heads.map(h=><th key={h} style={{color:'#555',textAlign:'right',padding:'8px',fontFamily:ff,fontSize:'12px'}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i}>{r.map((c,j)=>(
            <td key={j} style={{background:'#0d0d0d',padding:'10px',borderRadius:j===0?'0 8px 8px 0':j===r.length-1?'8px 0 0 8px':undefined,fontFamily:ff,fontSize:'13px'}}>{c}</td>
          ))}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

/* ── SVG Line Chart ── */
function LineChart({data,color,label}:{data:{x:string;y:number}[];color:string;label:string}) {
  if(data.length<2) return <div style={{color:'#333',textAlign:'center',padding:'20px',fontFamily:ff,fontSize:'12px'}}>يحتاج قياسين على الأقل لعرض الرسم البياني</div>;
  const W=400,H=120,pad=30;
  const ys=data.map(d=>d.y);
  const mn=Math.min(...ys),mx=Math.max(...ys);
  const range=mx-mn||1;
  const pts=data.map((d,i)=>({
    x:pad+(i/(data.length-1))*(W-2*pad),
    y:pad+((mx-d.y)/range)*(H-2*pad),
    v:d.y,lbl:d.x
  }));
  const path=pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fill=pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+` L${pts[pts.length-1].x},${H-pad} L${pts[0].x},${H-pad} Z`;
  return (
    <div style={{background:'#080808',borderRadius:'12px',padding:'12px',border:`1px solid ${color}22`}}>
      <div style={{color,fontSize:'12px',fontFamily:ff,marginBottom:'6px',fontWeight:700}}>{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'100px',overflow:'visible'}}>
        <defs>
          <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#g${color.replace('#','')})`}/>
        <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {pts.map((p,i)=>(
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={color}/>
            <text x={p.x} y={p.y-8} textAnchor="middle" fill={color} fontSize="9" fontFamily="Orbitron">{p.v}</text>
            <text x={p.x} y={H-5} textAnchor="middle" fill="#444" fontSize="8" fontFamily="Cairo">{p.lbl.slice(0,5)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Bar Chart ── */
function BarChart({income,expense}:{income:number;expense:number}) {
  const max=Math.max(income,expense,1);
  const items=[{l:'الدخل',v:income,c:'#00ff88'},{l:'الصرف',v:expense,c:'#ff3333'},{l:'الربح',v:income-expense,c:'#ccff00'}];
  return (
    <div style={{display:'flex',gap:'20px',alignItems:'flex-end',padding:'16px',background:'#080808',borderRadius:'12px',height:'130px'}}>
      {items.map(it=>(
        <div key={it.l} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',gap:'4px'}}>
          <span style={{color:it.c,fontFamily:fo,fontSize:'10px',fontWeight:900}}>{it.v.toFixed(0)}</span>
          <div style={{width:'100%',borderRadius:'4px 4px 0 0',height:`${Math.max(4,(Math.abs(it.v)/max)*80)}px`,background:it.v>=0?`linear-gradient(to top,${it.c}44,${it.c}aa)`:'linear-gradient(to top,#ff333344,#ff3333aa)',transition:'height 0.5s'}}/>
          <span style={{color:'#555',fontFamily:ff,fontSize:'10px'}}>{it.l}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function App() {
  const [screen,setScreen] = useState<Screen>('landing');
  const [section,setSection] = useState<Section>('dash');
  const [members,setMembers]   = useState<Member[]>(()=>ls('sl_m_v5',[]));
  const [staff,setStaff]       = useState<Staff[]>(()=>ls('sl_s_v4',[]));
  const [offers,setOffers]     = useState<Offer[]>(()=>ls('sl_o_v4',DEFAULT_OFFERS));
  const [finance,setFinance]   = useState<Finance[]>(()=>ls('sl_f_v5',[]));
  const [bookings,setBookings] = useState<Booking[]>(()=>ls('sl_b_v5',[]));
  const [suits,setSuits]       = useState<Suit[]>(()=>ls('sl_suits_v4',DEFAULT_SUITS));
  const [toast,setToast]       = useState('');
  const [motoIdx,setMotoIdx]   = useState(0);
  const [sidebarOpen,setSidebarOpen] = useState(true);

  /* forms */
  const [regImg,setRegImg]=useState('');const [regName,setRegName]=useState('');const [regAddr,setRegAddr]=useState('');
  const [regGoal,setRegGoal]=useState('تنشيف دهون');const [regChronic,setRegChronic]=useState('');const [regBone,setRegBone]=useState('');
  const [regOfferId,setRegOfferId]=useState<number|null>(null);const [regPaid,setRegPaid]=useState('');const [regCoach,setRegCoach]=useState('');
  const imgRef=useRef<HTMLInputElement>(null);
  const progPhotoRef=useRef<HTMLInputElement>(null);
  const [labMid,setLabMid]=useState('');const [labData,setLabData]=useState<LabData>(EMPTY_LAB);const [labAge,setLabAge]=useState('');
  const [progMid,setProgMid]=useState('');
  const [bookMid,setBookMid]=useState('');const [bookDate,setBookDate]=useState('');const [bookSuit,setBookSuit]=useState('');
  const [sName,setSName]=useState('');const [sSal,setSSal]=useState('');const [sTask,setSTask]=useState('');
  const [fDesc,setFDesc]=useState('');const [fAmt,setFAmt]=useState('');const [fCat,setFCat]=useState('عام');const [fType,setFType]=useState<'in'|'out'>('out');
  const [editFinId,setEditFinId]=useState<number|null>(null);
  const [oName,setOName]=useState('');const [oPrice,setOPrice]=useState('');const [oSess,setOSess]=useState('');
  const [portMid,setPortMid]=useState('');
  const [progPhotoNote,setProgPhotoNote]=useState('');

  /* persist */
  useEffect(()=>{sv('sl_m_v5',members);},[members]);
  useEffect(()=>{sv('sl_s_v4',staff);},[staff]);
  useEffect(()=>{sv('sl_o_v4',offers);},[offers]);
  useEffect(()=>{sv('sl_f_v5',finance);},[finance]);
  useEffect(()=>{sv('sl_b_v5',bookings);},[bookings]);
  useEffect(()=>{sv('sl_suits_v4',suits);},[suits]);
  useEffect(()=>{if(offers.length&&regOfferId===null)setRegOfferId(offers[0].id);},[offers]);

  /* timers */
  useEffect(()=>{const t=setInterval(()=>setMotoIdx(i=>(i+1)%MOTTOS.length),4000);return()=>clearInterval(t);},[]);

  /* Smart: reset suits if booking date passed */
  useEffect(()=>{
    const expired=bookings.filter(b=>b.time.slice(0,10)<TODAY);
    if(expired.length){
      const expIds=new Set(expired.map(b=>b.suitId));
      setSuits(p=>p.map(s=>expIds.has(s.id)&&s.status==='booked'?{...s,status:'avail'}:s));
    }
  },[]);

  const showToast=useCallback((msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000);},[]);

  /* computed */
  const selOffer=offers.find(o=>o.id===regOfferId);
  const regDebt=selOffer?(selOffer.price-(parseFloat(regPaid)||0)):0;
  const calcBMI=(h:string,w:string)=>{const hm=parseFloat(h)/100,wk=parseFloat(w);if(hm>0&&wk>0){const b=wk/(hm*hm);return{bmi:b.toFixed(1),fat:(b*1.2).toFixed(1)+'%',mus:(100-b*1.2).toFixed(1)+'%'};}return{bmi:'-',fat:'-',mus:'-'};};
  const aiStats=calcBMI(labData.h,labData.w);
  const finInc=finance.filter(x=>x.type==='in').reduce((a,b)=>a+b.amt,0);
  const finExp=finance.filter(x=>x.type==='out').reduce((a,b)=>a+b.amt,0);
  const portMember=members.find(x=>String(x.id)===portMid);
  const bookMember=members.find(x=>String(x.id)===bookMid);
  const progMember=members.find(x=>String(x.id)===progMid);

  /* Check today's bookings for suits */
  const todayBookedSuits=new Set(bookings.filter(b=>b.time.slice(0,10)===TODAY).map(b=>b.suitId));

  /* actions */
  function handleImg(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setRegImg(ev.target?.result as string);r.readAsDataURL(f);}

  function saveMember(){
    if(!regName.trim())return showToast('يرجى إدخال الاسم');
    if(!selOffer)return showToast('يرجى اختيار باقة');
    const m:Member={id:Date.now(),name:regName.trim(),addr:regAddr,goal:regGoal,chronic:regChronic,bone:regBone,total:selOffer.price,paid:parseFloat(regPaid)||0,debt:regDebt,rem_sess:selOffer.sess,coach:regCoach||(staff[0]?.name??''),img:regImg,lab:{...EMPTY_LAB},history:[],diet:'',train:'',date:new Date().toLocaleDateString('ar-EG'),photos:[]};
    setMembers(p=>[...p,m]);
    if(m.paid>0)setFinance(p=>[...p,{id:Date.now(),date:new Date().toLocaleString(),desc:`اشتراك: ${m.name}`,amt:m.paid,type:'in',cat:'اشتراكات'}]);
    setRegName('');setRegAddr('');setRegChronic('');setRegBone('');setRegPaid('');setRegImg('');
    showToast('تمت الإضافة بنجاح ✅');setSection('dash');
  }

  function loadLab(id:string){setLabMid(id);const m=members.find(x=>String(x.id)===id);if(m){setLabData({...EMPTY_LAB,...m.lab});setLabAge(m.lab.age||'');}else setLabData(EMPTY_LAB);}
  function saveLab(){const m=members.find(x=>String(x.id)===labMid);if(!m)return showToast('اختر مشترك');const ai=calcBMI(labData.h,labData.w);const e:HistoryEntry={...labData,date:new Date().toLocaleDateString('ar-EG'),...ai};setMembers(p=>p.map(x=>x.id===m.id?{...x,lab:{...labData,...ai},history:[...(x.history||[]),e]}:x));showToast('تم حفظ القياسات ✅');}

  /* Upload progress photo */
  function handleProgPhoto(e:React.ChangeEvent<HTMLInputElement>){
    const f=e.target.files?.[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      const img=ev.target?.result as string;
      const m=members.find(x=>String(x.id)===portMid);
      if(!m)return showToast('اختر مشترك أولاً');
      const photo:ProgressPhoto={img,date:new Date().toLocaleString('ar-EG'),note:progPhotoNote};
      setMembers(p=>p.map(x=>x.id===m.id?{...x,photos:[...(x.photos||[]),photo]}:x));
      setProgPhotoNote('');showToast('تم رفع الصورة ✅');
    };
    r.readAsDataURL(f);
  }

  /* Generate comprehensive plan */
  function genProg(){
    const m=members.find(x=>String(x.id)===progMid);if(!m)return showToast('اختر مشترك');
    const w=parseFloat(m.lab.w)||70;const h=parseFloat(m.lab.h)||170;
    const cal=Math.round(w*25);const pro=Math.round(w*2);const fat=Math.round(w*0.8);const carb=Math.round((cal-pro*4-fat*9)/4);
    const isGoalFat=m.goal.includes('تنشيف')||m.goal.includes('دهون');
    const isGoalMuscle=m.goal.includes('تضخيم')||m.goal.includes('عضلي');
    const dietPlan=`═══════════════════════════════
🥗 خطة التغذية الشاملة — ${m.name}
═══════════════════════════════
⚡ هدف السعرات: ${isGoalFat?cal-300:isGoalMuscle?cal+300:cal} سعرة/يوم
🥩 البروتين: ${pro}غ/يوم  🍞 الكربوهيدرات: ${carb}غ/يوم  🫒 الدهون: ${fat}غ/يوم

──────────────────────────────
🌅 الإفطار (07:00–08:00)
──────────────────────────────
• 3 بيضات مسلوقة أو مقلية بزيت زيتون
• شريحة خبز أسمر أو شوفان (40غ)
• تفاحة أو موزة صغيرة
• كوب قهوة أو شاي بدون سكر

──────────────────────────────
🥜 وجبة خفيفة صباح (10:30)
──────────────────────────────
• حفنة مكسرات غير مملحة (30غ)
• جبنة قريش أو يوغرت يوناني

──────────────────────────────
☀️ الغداء (13:00–14:00)
──────────────────────────────
• ${isGoalMuscle?'200غ':'150غ'} صدر دجاج / لحم بقر / سمك
• كوب أرز بسمتي أو بطاطا مسلوقة
• سلطة خضراء كبيرة بزيت زيتون وليمون
• كوب شوربة خضار

──────────────────────────────
🏃 قبل التدريب (ساعة قبل الجلسة)
──────────────────────────────
• موزة + ملعقة عسل
• أو كوب شوفان مع مكسرات

──────────────────────────────
💪 بعد التدريب (خلال 30 دقيقة)
──────────────────────────────
• شيكر بروتين (30غ مسحوق بروتين)
• أو 200غ يوغرت يوناني + موزة

──────────────────────────────
🌙 العشاء (19:00–20:00)
──────────────────────────────
• ${isGoalFat?'150غ سمك مشوي':'200غ صدر دجاج مشوي'}
• خضار مشوية أو طازجة
• ${isGoalFat?'بدون نشويات':'نصف كوب كينوا أو خبز أسمر'}

══════════════════════════════
💊 المكملات الغذائية الموصى بها
══════════════════════════════
${isGoalMuscle?`⚡ بروتين واي (Whey Protein)
   • الجرعة: 30غ بعد التدريب مباشرة
   • الهدف: بناء العضل وإعادة التعافي

💪 كرياتين (Creatine Monohydrate)
   • الجرعة: 5غ يومياً مع الماء
   • الهدف: زيادة القوة والحجم العضلي

🔋 BCAAs (أحماض أمينية متشعبة)
   • الجرعة: 10غ قبل/بعد التدريب
   • الهدف: منع كسر العضل`:isGoalFat?`🔥 L-Carnitine (كارنيتين)
   • الجرعة: 2غ قبل التدريب بـ30 دقيقة
   • الهدف: تحفيز حرق الدهون

🌿 CLA (حمض اللينوليك المترافق)
   • الجرعة: 1غ مع كل وجبة رئيسية
   • الهدف: تنشيف دهون البطن

⚡ Green Tea Extract (خلاصة الشاي الأخضر)
   • الجرعة: كبسولة مرتين يومياً
   • الهدف: رفع معدل الحرق الأساسي`:`🌟 فيتامين د3
   • الجرعة: 2000 IU يومياً
   • الهدف: صحة العظام والعضلات`}

🌟 أوميغا 3 (Omega-3)
   • الجرعة: 2–3غ يومياً مع وجبة
   • الهدف: صحة القلب وتقليل الالتهابات

💤 ماغنيسيوم (Magnesium)
   • الجرعة: 300–400مغ قبل النوم
   • الهدف: استرخاء عضلي وجودة النوم

🩺 تنبيه طبي: ${m.chronic?'⚠️ مريض بـ '+m.chronic+' — استشر طبيبك قبل أي مكمل':'لا توجد قيود مزمنة مسجلة'}`;

    const trainPlan=`═══════════════════════════════
⚡ البرنامج التدريبي الشامل — ${m.name}
═══════════════════════════════
🎯 الهدف: ${m.goal}  |  🏋️ التخصص: ${m.bone||'كامل الجسم'}

──────────────────────────────
⚡ جلسة EMS (مرتين أسبوعياً — 20 دقيقة)
──────────────────────────────
• التردد: 85 Hz | النبضة: 350 µs
• مرحلة الإحماء (3 دقائق): تردد 30 Hz
• مرحلة العمل (12 دقيقة): تردد 80–95 Hz
  - دقيقتان تقلصات متواصلة
  - دقيقة استراحة نشطة
  - تكرار 4 دورات
• تهدئة (5 دقائق): تردد 15 Hz + تمدد
• المناطق المُنشطة: ${m.bone||'الصدر، الظهر، البطن، الأرداف، الفخذين'}

──────────────────────────────
🏋️ اليوم الأول: الصدر + الكتفين + الترايسبس
──────────────────────────────
• بنش برس بالبار: 4×10 تكرار | 70% من أقصى ثقل
• تمرين الفراشة (Pec Deck): 3×12 تكرار
• دمبل فلاي مائل: 3×12 تكرار
• ضغط الكتف بالدمبل: 4×10 تكرار
• رفع جانبي للكتفين: 3×15 تكرار
• تمديد الترايسبس بالبكرة: 3×15 تكرار
• ضغط ضيق بالبار: 3×12 تكرار

──────────────────────────────
🦵 اليوم الثاني: الأرجل + الأرداف
──────────────────────────────
• سكوات بالبار: 4×12 تكرار
• Leg Press (ضغط الأرجل): 4×15 تكرار
• Leg Curl (جهاز ثني الركبة): 3×12 تكرار
• Leg Extension: 3×12 تكرار
• Hip Thrust (دفع الأرداف): 4×15 تكرار
• وقفة الساقين (Calf Raise): 4×20 تكرار
• لانج بالدمبل: 3×12 لكل رجل

──────────────────────────────
💪 اليوم الثالث: الظهر + البايسبس
──────────────────────────────
• Lat Pulldown (سحب البكرة العلوية): 4×12
• صف القارب (Seated Row): 4×12 تكرار
• Deadlift (رفع أرضي): 4×8 تكرار
• سحب بالعارضة (Pull Up): 3×أقصى ما يمكن
• Hammer Curl بالدمبل: 3×12 تكرار
• تمرين الكيبل للبايسبس: 3×15 تكرار

──────────────────────────────
🔥 اليوم الرابع: بطن + كارديو
──────────────────────────────
• Plank: 3×60 ثانية
• Crunch بالجهاز: 3×20 تكرار
• Russian Twist: 3×20 تكرار لكل جهة
• Hanging Leg Raise: 3×15 تكرار
• ${isGoalFat?'HIIT على جهاز التردميل: 20 دقيقة':'ركض خفيف 20 دقيقة'}
• دراجة ثابتة 15 دقيقة

══════════════════════════════
⏱️ جدول الأسبوع المقترح
══════════════════════════════
• السبت: صدر + كتفين (جيم) + EMS
• الأحد: أرجل (جيم)
• الاثنين: راحة أو كارديو خفيف
• الثلاثاء: ظهر + بايسبس (جيم) + EMS
• الأربعاء: بطن + كارديو
• الخميس/الجمعة: راحة تامة`;

    setMembers(p=>p.map(x=>x.id===m.id?{...x,diet:dietPlan,train:trainPlan}:x));
    showToast('✅ تم توليد الخطة الشاملة');
  }

  function confirmBook(){
    if(!bookMid||!bookSuit||!bookDate)return showToast('اكمل بيانات الحجز');
    const m=members.find(x=>String(x.id)===bookMid);if(!m)return;
    if(m.rem_sess<=0)return showToast('لا يوجد جلسات متبقية');
    const s=suits.find(x=>String(x.id)===bookSuit);if(!s)return;
    const bDate=bookDate.slice(0,10);
    setMembers(p=>p.map(x=>x.id===m.id?{...x,rem_sess:x.rem_sess-1}:x));
    if(bDate===TODAY)setSuits(p=>p.map(x=>String(x.id)===bookSuit?{...x,status:'booked'}:x));
    setBookings(p=>[...p,{id:Date.now(),mId:m.id,mName:m.name,time:bookDate,suitId:s.id,suitSize:s.size}]);
    setBookMid('');setBookDate('');setBookSuit('');showToast('تم التثبيت ✅');
  }

  function cancelBooking(bid:number){
    if(!confirm('إلغاء هذا الحجز؟'))return;
    const b=bookings.find(x=>x.id===bid);if(!b)return;
    setBookings(p=>p.filter(x=>x.id!==bid));
    setSuits(p=>p.map(s=>s.id===b.suitId&&s.status==='booked'?{...s,status:'avail'}:s));
    setMembers(p=>p.map(m=>m.id===b.mId?{...m,rem_sess:m.rem_sess+1}:m));
    showToast('تم إلغاء الحجز وإعادة الجلسة ✅');
  }

  function toggleSuit(id:number){setSuits(p=>p.map(s=>s.id===id?{...s,status:s.status==='avail'?'broken':s.status==='broken'?'avail':s.status}:s));}
  function addStaff(){if(!sName.trim())return showToast('أدخل الاسم');setStaff(p=>[...p,{id:Date.now(),name:sName,salary:parseFloat(sSal)||0,task:sTask,loans:0}]);setSName('');setSSal('');setSTask('');showToast('تمت الإضافة');}
  function addLoan(id:number){const a=parseFloat(prompt('المبلغ:')||'0');if(!a)return;const s=staff.find(x=>x.id===id);if(!s)return;setStaff(p=>p.map(x=>x.id===id?{...x,loans:x.loans+a}:x));setFinance(p=>[...p,{id:Date.now(),date:new Date().toLocaleString(),desc:`سلفة: ${s.name}`,amt:a,type:'out',cat:'رواتب وسلف'}]);showToast('سُجلت السلفة');}

  function saveFinance(){
    const a=parseFloat(fAmt);if(!a||!fDesc)return showToast('أدخل البيان والمبلغ');
    if(editFinId!==null){
      setFinance(p=>p.map(f=>f.id===editFinId?{...f,desc:fDesc,amt:a,type:fType,cat:fCat}:f));
      setEditFinId(null);showToast('تم التعديل ✅');
    }else{
      setFinance(p=>[...p,{id:Date.now(),date:new Date().toLocaleString(),desc:fDesc,amt:a,type:fType,cat:fCat}]);
      showToast(fType==='in'?'تم تسجيل الدخل ✅':'تم تسجيل الصرف ✅');
    }
    setFDesc('');setFAmt('');setFCat('عام');
  }

  function editFin(f:Finance){setEditFinId(f.id);setFDesc(f.desc);setFAmt(String(f.amt));setFType(f.type);setFCat(f.cat);}
  function deleteFin(id:number){if(!confirm('حذف هذه المعاملة؟'))return;setFinance(p=>p.filter(f=>f.id!==id));showToast('تم الحذف');}

  function addOffer(){if(!oName||!oPrice||!oSess)return showToast('اكمل البيانات');setOffers(p=>[...p,{id:Date.now(),name:oName,price:parseFloat(oPrice),sess:parseInt(oSess)}]);setOName('');setOPrice('');setOSess('');showToast('تمت الإضافة ✅');}
  function delOffer(id:number){if(!confirm('حذف هذا العرض؟'))return;setOffers(p=>p.filter(o=>o.id!==id));}

  const menuItems:{id:Section;icon:string;label:string}[] = [
    {id:'dash',icon:'📊',label:'الرادار الذكي'},{id:'reg',icon:'👤',label:'تسجيل عضو'},
    {id:'lab',icon:'🔬',label:'قياسات AI'},{id:'prog',icon:'🍎',label:'الخطط الذكية'},
    {id:'book',icon:'📅',label:'الحجز الذكي'},{id:'staff',icon:'👔',label:'الموظفين'},
    {id:'fin',icon:'💰',label:'التقارير المالية'},{id:'off',icon:'🎁',label:'العروض'},
    {id:'port',icon:'📂',label:'الملف الشامل'},
  ];
  const sec=(id:Section):React.CSSProperties=>({display:section===id?'block':'none'});

  /* ━━━━━━━━━ LANDING ━━━━━━━━━ */
  if(screen==='landing') return (
    <div style={{minHeight:'100vh',background:'#050505',fontFamily:ff,direction:'rtl',overflow:'hidden'}}>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',height:'64px',background:'rgba(0,0,0,0.9)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(204,255,0,0.15)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <img src={logoImg} alt="logo" style={{width:'38px',height:'38px',borderRadius:'50%',objectFit:'cover',border:'2px solid #ccff00'}}/>
          <div>
            <div style={{color:'#ccff00',fontFamily:fo,fontSize:'12px',fontWeight:900,letterSpacing:'1px'}}>SMART SPORT LAND</div>
            <div style={{color:'#444',fontSize:'9px',fontFamily:fo,letterSpacing:'2px'}}>EMS TECHNOLOGY</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'36px',alignItems:'center'}}>
          <span style={{color:'#ccff00',fontSize:'14px',cursor:'pointer',fontWeight:700,fontFamily:ff,borderBottom:'2px solid #ccff00',paddingBottom:'2px'}}>الرئيسية</span>
          <span style={{color:'#999',fontSize:'14px',cursor:'pointer',fontWeight:600,fontFamily:ff}} onClick={()=>setScreen('admin')}>الإدارة</span>
        </div>
        <button onClick={()=>setScreen('admin')} style={{background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'10px 22px',borderRadius:'8px',fontWeight:900,cursor:'pointer',fontFamily:ff,fontSize:'13px',boxShadow:'0 4px 20px rgba(204,255,0,0.35)'}}>⚡ لوحة الإدارة</button>
      </nav>
      <div style={{position:'relative',height:'100vh',display:'flex',alignItems:'center',overflow:'hidden',background:'#000'}}>
        <img src={athletesImg} alt="EMS Athletes" style={{position:'absolute',bottom:0,left:0,height:'100%',width:'55%',objectFit:'cover',objectPosition:'top center',mixBlendMode:'luminosity',filter:'contrast(1.15) brightness(0.75) saturate(0.6)',zIndex:2}}/>
        <div style={{position:'absolute',bottom:0,left:0,width:'52%',height:'100%',zIndex:1,background:'radial-gradient(ellipse at 50% 80%, rgba(204,255,0,0.08) 0%, transparent 65%)'}}/>
        <div style={{position:'absolute',inset:0,zIndex:3,background:'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 38%, rgba(0,0,0,0.88) 55%, #000 75%)'}}/>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'200px',zIndex:3,background:'linear-gradient(to top,#000,transparent)'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'120px',zIndex:3,background:'linear-gradient(to bottom,#000,transparent)'}}/>
        <div style={{position:'absolute',inset:0,zIndex:4,backgroundImage:'linear-gradient(rgba(204,255,0,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(204,255,0,0.02) 1px,transparent 1px)',backgroundSize:'50px 50px',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:10,marginRight:'0',marginLeft:'auto',width:'50%',padding:'80px 5% 130px 3%'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(204,255,0,0.1)',border:'1px solid rgba(204,255,0,0.4)',borderRadius:'30px',padding:'5px 16px',marginBottom:'20px'}}>
            <span style={{color:'#ccff00',fontSize:'14px'}}>⚡</span>
            <span style={{color:'#ccff00',fontSize:'12px',fontWeight:700,fontFamily:ff}}>لياقة الجيل القادم</span>
          </div>
          <h1 style={{margin:'0 0 14px',lineHeight:1.05,fontFamily:ff,padding:0}}>
            <span style={{display:'block',color:'#ffffff',fontSize:'clamp(44px,6.5vw,78px)',fontWeight:900,letterSpacing:'-1px'}}>٢٠ دقيقة.</span>
            <span style={{display:'block',color:'#ccff00',fontSize:'clamp(44px,6.5vw,78px)',fontWeight:900,letterSpacing:'-1px',textShadow:'0 0 40px rgba(204,255,0,0.45),0 0 80px rgba(204,255,0,0.2)'}}>أقصى تأثير.</span>
          </h1>
          <p style={{color:'rgba(255,255,255,0.68)',fontSize:'clamp(13px,1.5vw,16px)',lineHeight:2,margin:'0 0 28px',fontFamily:ff,maxWidth:'420px'}}>
            يُنشط تحفيز العضلات الكهربائي (EMS) 90% من ألياف عضلاتك في آن واحد.<br/>
            حقق في 20 دقيقة ما يستغرق ساعتين في صالة تقليدية.
          </p>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
            <button onClick={()=>setScreen('admin')} style={{background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'14px 30px',borderRadius:'10px',fontWeight:900,cursor:'pointer',fontFamily:ff,fontSize:'15px',boxShadow:'0 6px 30px rgba(204,255,0,0.5)',display:'inline-flex',alignItems:'center',gap:'8px'}}>احجز جلسة تجريبية <span>←</span></button>
            <button onClick={()=>{setSection('off');setScreen('admin');}} style={{background:'rgba(255,255,255,0.06)',color:'#fff',border:'1px solid rgba(255,255,255,0.2)',padding:'14px 28px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontFamily:ff,fontSize:'14px'}}>عرض العروض</button>
          </div>
        </div>
        <div style={{position:'absolute',bottom:'92px',left:0,right:0,zIndex:6,pointerEvents:'none',opacity:0.25}}>
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{width:'100%',height:'55px'}}>
            <path d="M0 30 L180 30 L220 30 L250 8 L290 52 L325 10 L358 30 L420 30 L480 30 L520 6 L555 54 L590 12 L622 30 L700 30 L900 30 L1200 30" stroke="#ccff00" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <div style={{position:'absolute',bottom:'68px',left:'50%',transform:'translateX(-50%)',zIndex:10,display:'flex',alignItems:'center',gap:'10px',whiteSpace:'nowrap'}}>
          <div style={{height:'1px',width:'45px',background:'rgba(204,255,0,0.4)'}}/>
          <span style={{color:'rgba(204,255,0,0.8)',fontSize:'12px',fontFamily:ff,fontWeight:600}}>{MOTTOS[motoIdx]}</span>
          <div style={{height:'1px',width:'45px',background:'rgba(204,255,0,0.4)'}}/>
        </div>
        <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:10,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(14px)',borderTop:'1px solid rgba(204,255,0,0.15)',padding:'13px 6%',display:'flex',gap:'0',alignItems:'center'}}>
          {[{val:String(members.length),label:'مشترك نشط',col:'#ccff00'},{val:String(suits.filter(s=>s.status==='avail').length),label:'جهاز EMS متاح',col:'#00e5ff'},{val:String(bookings.length),label:'جلسة محجوزة',col:'#00ff88'},{val:'٢٠',label:'دقيقة للجلسة',col:'#ff69b4'}].map((s,i)=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:'10px',flex:1,borderRight:i<3?'1px solid #1a1a1a':'none',justifyContent:'center'}}>
              <div style={{color:s.col,fontSize:'26px',fontWeight:900,fontFamily:fo,lineHeight:1}}>{s.val}</div>
              <div style={{color:'#666',fontSize:'10px',fontFamily:ff,lineHeight:1.4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ━━━━━━━━━ ADMIN ━━━━━━━━━ */
  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#060606',fontFamily:ff,direction:'rtl'}}>
      {/* TOP NAV */}
      <div className="no-print" style={{position:'fixed',top:0,left:0,right:0,height:'52px',background:'rgba(0,0,0,0.95)',borderBottom:'1px solid #1a1a1a',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',zIndex:200,backdropFilter:'blur(10px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <img src={logoImg} alt="logo" style={{width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover',border:'1.5px solid #ccff00'}}/>
          <span style={{color:'#ccff00',fontFamily:fo,fontSize:'12px',fontWeight:900,letterSpacing:'1px'}}>SMART SPORT LAND</span>
          <span style={{color:'#333',margin:'0 4px'}}>|</span>
          <span style={{color:'#555',fontSize:'11px',fontFamily:fo,letterSpacing:'1px'}}>ADMIN</span>
        </div>
        <span style={{color:'rgba(204,255,0,0.7)',fontSize:'12px',fontFamily:ff}}>{MOTTOS[motoIdx]}</span>
        <button onClick={()=>setScreen('landing')} style={{background:'rgba(204,255,0,0.1)',color:'#ccff00',border:'1px solid rgba(204,255,0,0.3)',padding:'6px 16px',borderRadius:'8px',cursor:'pointer',fontFamily:ff,fontSize:'12px',fontWeight:700}}>← الواجهة الرئيسية</button>
      </div>

      {/* SIDEBAR */}
      <div className="no-print" style={{width:sidebarOpen?'240px':'62px',background:'linear-gradient(180deg,#000,#080808)',borderLeft:'1px solid #141414',display:'flex',flexDirection:'column',padding:'68px 10px 16px',overflowY:'auto',transition:'width 0.25s ease',flexShrink:0,position:'relative'}}>
        <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{position:'absolute',top:'60px',left:'8px',background:'#111',border:'1px solid #222',borderRadius:'8px',padding:'4px 8px',cursor:'pointer',color:'#555',fontSize:'14px'}}>{sidebarOpen?'◀':'▶'}</button>
        <nav style={{flex:1,marginTop:'20px'}}>
          {menuItems.map(item=>(
            <button key={item.id} onClick={()=>setSection(item.id)} style={{padding:sidebarOpen?'11px 14px':'11px',marginBottom:'4px',borderRadius:'10px',cursor:'pointer',color:section===item.id?'#000':'#777',fontWeight:section===item.id?900:600,border:'none',textAlign:'right' as const,background:section===item.id?'linear-gradient(135deg,#ccff00,#aae000)':'transparent',width:'100%',fontSize:'13px',display:'flex',alignItems:'center',gap:'10px',transition:'all 0.2s',fontFamily:ff,boxShadow:section===item.id?'0 3px 12px rgba(204,255,0,0.3)':'none'}}>
              <span style={{fontSize:'15px',flexShrink:0}}>{item.icon}</span>
              {sidebarOpen&&<span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen&&(
          <div style={{marginTop:'12px',padding:'10px',background:'#0a0a0a',borderRadius:'10px',border:'1px solid #1a1a1a'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
              {[{l:'أعضاء',v:members.length,c:'#ccff00'},{l:'موظفين',v:staff.length,c:'#00e5ff'},{l:'حجوزات',v:bookings.length,c:'#ff69b4'},{l:'عروض',v:offers.length,c:'#00ff88'}].map(s=>(
                <div key={s.l} style={{textAlign:'center',padding:'6px',background:'#111',borderRadius:'8px'}}>
                  <div style={{color:s.c,fontSize:'16px',fontWeight:900,fontFamily:fo}}>{s.v}</div>
                  <div style={{color:'#444',fontSize:'9px',fontFamily:ff}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{flex:1,overflowY:'auto',padding:'70px 24px 24px',background:'radial-gradient(ellipse at 30% 10%,#111 0%,#060606 70%)'}}>

        {/* ── DASHBOARD ── */}
        <div style={sec('dash')}>
          <div style={{position:'relative',borderRadius:'20px',overflow:'hidden',marginBottom:'20px',height:'200px'}}>
            <div style={{position:'absolute',inset:0,backgroundImage:`url(${heroBg})`,backgroundSize:'cover',backgroundPosition:'center top',filter:'brightness(0.3)'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to left,rgba(0,0,0,0.2),rgba(0,0,0,0.8))'}}/>
            <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(204,255,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(204,255,0,0.03) 1px,transparent 1px)',backgroundSize:'30px 30px'}}/>
            <div style={{position:'relative',zIndex:10,padding:'30px 36px',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{color:'#ccff00',fontSize:'10px',fontFamily:fo,letterSpacing:'3px',marginBottom:'8px',opacity:0.8}}>NABLUS · PALESTINE · EMS TRAINING</div>
              <div style={{fontFamily:fo,fontSize:'clamp(20px,3vw,32px)',fontWeight:900,background:'linear-gradient(135deg,#fff,#ccff00)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.1}}>SMART SPORT LAND</div>
              <div style={{display:'flex',gap:'20px',marginTop:'16px',flexWrap:'wrap'}}>
                {[{l:'أعضاء نشطين',v:members.length,c:'#ccff00'},{l:'أجهزة متاحة',v:suits.filter(s=>s.status==='avail').length,c:'#00e5ff'},{l:'حجوزات اليوم',v:bookings.filter(b=>b.time.slice(0,10)===TODAY).length,c:'#00ff88'},{l:'ديون مفتوحة',v:members.filter(m=>m.debt>0).length,c:'#ff3333'}].map(s=>(
                  <div key={s.l} style={{background:'rgba(0,0,0,0.5)',border:`1px solid ${s.c}33`,borderRadius:'10px',padding:'8px 16px',textAlign:'center',backdropFilter:'blur(10px)'}}>
                    <div style={{color:s.c,fontSize:'22px',fontWeight:900,fontFamily:fo,lineHeight:1}}>{s.v}</div>
                    <div style={{color:'rgba(255,255,255,0.5)',fontSize:'10px',fontFamily:ff,marginTop:'3px'}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{...g3,marginBottom:'18px'}}>
            <div style={card({borderTop:'3px solid #ff3333'})}>
              <h3 style={{...h3s,color:'#ff3333',display:'flex',alignItems:'center',gap:'8px'}}><span>💸</span>ديون المشتركين</h3>
              <div style={{maxHeight:'160px',overflowY:'auto'}}>
                {members.filter(x=>x.debt>0).length===0?<p style={{color:'#333',textAlign:'center',padding:'20px',fontFamily:ff}}>✅ لا ديون</p>
                :members.filter(x=>x.debt>0).map(x=>(
                  <div key={x.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:'8px',background:'rgba(255,51,51,0.05)',marginBottom:'5px',border:'1px solid rgba(255,51,51,0.12)'}}>
                    <span style={{fontFamily:ff,fontWeight:600}}>{x.name}</span>
                    <span style={{color:'#ff3333',fontWeight:900,fontFamily:fo,fontSize:'13px'}}>{x.debt} ₪</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={card({borderTop:'3px solid #00e5ff'})}>
              <h3 style={{...h3s,color:'#00e5ff',display:'flex',alignItems:'center',gap:'8px'}}><span>📅</span>حجوزات اليوم</h3>
              <div style={{maxHeight:'160px',overflowY:'auto'}}>
                {bookings.filter(b=>b.time.slice(0,10)===TODAY).length===0?<p style={{color:'#333',textAlign:'center',padding:'20px',fontFamily:ff}}>لا حجوزات اليوم</p>
                :bookings.filter(b=>b.time.slice(0,10)===TODAY).map((x,i)=>(
                  <div key={i} style={{padding:'8px 12px',background:'rgba(0,229,255,0.05)',borderRadius:'8px',marginBottom:'5px',borderRight:'3px solid #00e5ff',fontSize:'12px',fontFamily:ff}}>
                    <strong>{x.mName}</strong> | {x.time.replace('T',' ')} | بدلة {x.suitId}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={card()}>
            <h3 style={{...h3s,display:'flex',alignItems:'center',gap:'10px'}}><span>⚡</span>حالة أجهزة EMS
              <span style={{fontSize:'11px',color:'#444',fontWeight:400}}>(أخضر=متاح | أزرق=محجوز اليوم | أحمر=معطل | اضغط للتبديل)</span></h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px'}}>
              {suits.map(suit=>{
                const isBookedToday=todayBookedSuits.has(suit.id)&&suit.status==='booked';
                const displayStatus=isBookedToday?'booked':suit.status==='broken'?'broken':'avail';
                const cfg={avail:{c:'#00ff88',l:'متاح'},booked:{c:'#00e5ff',l:'محجوز'},broken:{c:'#ff3333',l:'معطل'}}[displayStatus];
                return(
                  <div key={suit.id} onClick={()=>toggleSuit(suit.id)} style={{padding:'14px 8px',borderRadius:'12px',border:`1px solid ${cfg.c}44`,textAlign:'center',cursor:'pointer',color:cfg.c,background:`${cfg.c}08`,opacity:suit.status==='broken'?0.5:1,transition:'all 0.2s',position:'relative'}}>
                    {isBookedToday&&<div style={{position:'absolute',top:'4px',right:'50%',transform:'translateX(50%)',background:'#00e5ff',color:'#000',fontSize:'7px',borderRadius:'6px',padding:'1px 5px',fontWeight:900,fontFamily:ff}}>محجوز</div>}
                    <div style={{fontSize:'15px',fontFamily:fo,fontWeight:900,marginTop:isBookedToday?'8px':'0'}}>{suit.size}</div>
                    <div style={{fontSize:'9px',marginTop:'3px',fontFamily:ff,opacity:0.8}}>{cfg.l}</div>
                    <div style={{fontSize:'9px',color:'#333',fontFamily:fo}}>#{suit.id}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── REGISTRATION ── */}
        <div style={sec('reg')}>
          <div style={{...card(),position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:'4px',background:'linear-gradient(90deg,#ccff00,#00e5ff,#ccff00)'}}/>
            <h3 style={h3s}>👤 تسجيل عضو جديد</h3>
            <div style={{textAlign:'center',marginBottom:'22px'}}>
              <div onClick={()=>imgRef.current?.click()} style={{width:'120px',height:'120px',borderRadius:'50%',border:regImg?'3px solid #ccff00':'3px dashed #2a2a2a',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',background:'#080808',boxShadow:regImg?'0 0 20px rgba(204,255,0,0.3)':'none',transition:'all 0.3s'}}>
                {regImg?<img src={regImg} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<div style={{textAlign:'center',color:'#333'}}><div style={{fontSize:'26px'}}>📷</div><div style={{fontSize:'10px',fontFamily:ff}}>صورة</div></div>}
              </div>
              <input ref={imgRef} type="file" accept="image/*" hidden onChange={handleImg}/>
            </div>
            <div style={g3}>
              <div><label style={lbl}>الاسم الكامل</label><input style={inp} type="text" placeholder="الاسم الرباعي" value={regName} onChange={e=>setRegName(e.target.value)}/></div>
              <div><label style={lbl}>السكن / الهاتف</label><input style={inp} type="text" placeholder="العنوان ورقم التواصل" value={regAddr} onChange={e=>setRegAddr(e.target.value)}/></div>
              <div><label style={lbl}>الهدف الرئيسي</label><select style={inp} value={regGoal} onChange={e=>setRegGoal(e.target.value)}>{['تنشيف دهون','تضخيم عضلي','لياقة بدنية','علاجي / إصابات'].map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div style={{...g3,marginTop:'14px'}}>
              <div><label style={lbl}>أمراض مزمنة</label><input style={inp} type="text" placeholder="سكري، ضغط..." value={regChronic} onChange={e=>setRegChronic(e.target.value)}/></div>
              <div><label style={lbl}>إصابات هيكلية</label><input style={inp} type="text" placeholder="ديسك، مفاصل..." value={regBone} onChange={e=>setRegBone(e.target.value)}/></div>
              <div><label style={lbl}>الباقة</label><select style={inp} value={regOfferId??''} onChange={e=>setRegOfferId(Number(e.target.value))}>{offers.map(o=><option key={o.id} value={o.id}>{o.name} ({o.price}₪ / {o.sess} جلسة)</option>)}</select></div>
            </div>
            <div style={{...g3,marginTop:'14px'}}>
              <div><label style={lbl}>المبلغ المدفوع (₪)</label><input style={inp} type="number" value={regPaid} onChange={e=>setRegPaid(e.target.value)}/></div>
              <div><label style={lbl}>الدين المتبقي</label><input style={{...inp,color:'#ff3333',fontWeight:900,fontFamily:fo}} readOnly value={`${regDebt} ₪`}/></div>
              <div><label style={lbl}>المدرب</label><select style={inp} value={regCoach} onChange={e=>setRegCoach(e.target.value)}>{staff.length===0?<option>لا يوجد مدربين</option>:staff.map(s=><option key={s.id}>{s.name}</option>)}</select></div>
            </div>
            <button style={btnN()} onClick={saveMember}>⚡ تثبيت الاشتراك</button>
          </div>
        </div>

        {/* ── LAB ── */}
        <div style={sec('lab')}>
          <div style={card()}>
            <h3 style={h3s}>🔬 قياسات الجسم — تحليل AI</h3>
            <select style={inp} value={labMid} onChange={e=>loadLab(e.target.value)}><option value="">-- اختر مشترك --</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <h4 style={h4n}>📏 القياسات الأساسية</h4>
            <div style={g3}>
              <div><label style={lbl}>الطول (سم)</label><input style={inp} type="number" placeholder="175" value={labData.h} onChange={e=>setLabData(p=>({...p,h:e.target.value}))}/></div>
              <div><label style={lbl}>الوزن (كغم)</label><input style={inp} type="number" placeholder="75" value={labData.w} onChange={e=>setLabData(p=>({...p,w:e.target.value}))}/></div>
              <div><label style={lbl}>العمر</label><input style={inp} type="number" placeholder="25" value={labAge} onChange={e=>setLabAge(e.target.value)}/></div>
            </div>
            <h4 style={h4a}>📐 قياسات الجسم (سم)</h4>
            <div style={g4}>
              {[{l:'الرقبة',k:'neck'},{l:'الصدر',k:'chest'},{l:'الخصر',k:'waist'},{l:'الأرداف',k:'hips'},{l:'الفخذ ي',k:'thighR'},{l:'الفخذ ش',k:'thighL'},{l:'الذراع ي',k:'armR'},{l:'الذراع ش',k:'armL'}].map(({l,k})=>(
                <div key={k}><label style={lbl}>{l}</label><input style={inp} type="number" placeholder="0" value={(labData as Record<string,string>)[k]||''} onChange={e=>setLabData(p=>({...p,[k]:e.target.value}))}/></div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginTop:'20px'}}>
              {[{l:'BMI',v:aiStats.bmi,c:'#ccff00',ic:'⚖️'},{l:'الدهون %',v:aiStats.fat,c:'#ff3333',ic:'🔥'},{l:'العضل %',v:aiStats.mus,c:'#00ff88',ic:'💪'}].map(s=>(
                <div key={s.l} style={{background:'#0a0a0a',border:`1px solid ${s.c}22`,borderRadius:'14px',padding:'18px',textAlign:'center'}}>
                  <div style={{fontSize:'22px'}}>{s.ic}</div>
                  <div style={{color:'#555',fontSize:'11px',fontFamily:ff,margin:'4px 0'}}>{s.l}</div>
                  <div style={{color:s.c,fontSize:'26px',fontWeight:900,fontFamily:fo}}>{s.v}</div>
                </div>
              ))}
            </div>
            <button style={btnN()} onClick={saveLab}>💾 حفظ القياسات</button>
          </div>

          {/* Progress Charts */}
          {labMid&&(()=>{
            const m=members.find(x=>String(x.id)===labMid);
            if(!m?.history?.length)return null;
            const wData=m.history.map(h=>({x:h.date,y:parseFloat(h.w)||0})).filter(d=>d.y>0);
            const waistData=m.history.map(h=>({x:h.date,y:parseFloat(h.waist)||0})).filter(d=>d.y>0);
            const neckData=m.history.map(h=>({x:h.date,y:parseFloat(h.neck)||0})).filter(d=>d.y>0);
            return(
              <div style={card()}>
                <h3 style={h3s}>📈 تطور القياسات بيانياً</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'16px',marginBottom:'16px'}}>
                  <LineChart data={wData} color="#ccff00" label="تطور الوزن (كغم)"/>
                  <LineChart data={waistData} color="#00e5ff" label="تطور الخصر (سم)"/>
                  {neckData.length>=2&&<LineChart data={neckData} color="#00ff88" label="تطور الرقبة (سم)"/>}
                </div>
                <h4 style={h4n}>📜 السجل التاريخي</h4>
                <Tbl heads={['التاريخ','الوزن','الرقبة','الخصر','الأرداف','الدهون','BMI']} rows={[...m.history].reverse().map(h=>[h.date,h.w,h.neck||'-',h.waist,h.hips||'-',h.fat||'-',h.bmi||'-'])}/>
              </div>
            );
          })()}
        </div>

        {/* ── SMART PLANS ── */}
        <div style={sec('prog')}>
          <div style={card()}>
            <h3 style={{...h3s,display:'flex',alignItems:'center',gap:'10px'}}>
              <span style={{fontSize:'24px'}}>🧠</span>
              <span>الخطط الذكية الشاملة</span>
              <span style={{fontSize:'11px',color:'#444',fontWeight:400,marginRight:'auto'}}>AI-Powered Personalized Plans</span>
            </h3>
            <div style={{display:'flex',gap:'12px',alignItems:'flex-end',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:'200px'}}>
                <label style={lbl}>اختر المشترك</label>
                <select style={inp} value={progMid} onChange={e=>setProgMid(e.target.value)}><option value="">-- اختر مشترك --</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} — {m.goal}</option>)}</select>
              </div>
              {progMember&&(
                <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                  <div style={{padding:'8px 14px',background:'rgba(204,255,0,0.08)',border:'1px solid rgba(204,255,0,0.2)',borderRadius:'8px',textAlign:'center'}}>
                    <div style={{color:'#ccff00',fontFamily:fo,fontWeight:900,fontSize:'14px'}}>{progMember.lab.bmi||'-'}</div>
                    <div style={{color:'#555',fontSize:'9px',fontFamily:ff}}>BMI</div>
                  </div>
                  <div style={{padding:'8px 14px',background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.2)',borderRadius:'8px',textAlign:'center'}}>
                    <div style={{color:'#00e5ff',fontFamily:fo,fontWeight:900,fontSize:'14px'}}>{progMember.lab.w||'?'}</div>
                    <div style={{color:'#555',fontSize:'9px',fontFamily:ff}}>كغم</div>
                  </div>
                  <div style={{padding:'8px 14px',background:'rgba(0,255,136,0.08)',border:'1px solid rgba(0,255,136,0.2)',borderRadius:'8px',textAlign:'center'}}>
                    <div style={{color:'#00ff88',fontSize:'12px',fontFamily:ff,fontWeight:700}}>{progMember.goal}</div>
                    <div style={{color:'#555',fontSize:'9px',fontFamily:ff}}>الهدف</div>
                  </div>
                </div>
              )}
            </div>
            <button style={btnA({marginTop:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'})} onClick={genProg}>
              <span style={{fontSize:'18px'}}>✨</span>
              <span>توليد الخطة الشاملة (تغذية + مكملات + تدريب)</span>
            </button>
          </div>

          {progMember&&progMember.diet&&(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(500px,1fr))',gap:'18px'}}>
              {/* Diet Plan Card */}
              <div style={{...card({border:'1px solid rgba(0,255,136,0.2)',background:'linear-gradient(145deg,#0a0e0a,#0d130d)'})}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'18px'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'linear-gradient(135deg,#00ff8822,#00ff8844)',border:'1px solid rgba(0,255,136,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>🥗</div>
                  <div>
                    <div style={{color:'#00ff88',fontWeight:900,fontFamily:ff,fontSize:'16px'}}>خطة التغذية والمكملات</div>
                    <div style={{color:'#3a5a3a',fontSize:'11px',fontFamily:fo}}>NUTRITION & SUPPLEMENTS PLAN</div>
                  </div>
                  <button onClick={()=>setMembers(p=>p.map(x=>x.id===progMember.id?{...x,diet:''}:x))} style={{marginRight:'auto',background:'rgba(255,51,51,0.1)',color:'#ff3333',border:'1px solid rgba(255,51,51,0.2)',borderRadius:'8px',padding:'5px 12px',cursor:'pointer',fontFamily:ff,fontSize:'11px'}}>مسح</button>
                </div>
                <div style={{...inp,height:'auto',minHeight:'500px',maxHeight:'600px',overflowY:'auto',whiteSpace:'pre-wrap',lineHeight:2,fontSize:'12px',color:'#bbb',background:'#060f06',border:'1px solid rgba(0,255,136,0.1)'}}>{progMember.diet}</div>
                <button style={btnN({background:'linear-gradient(135deg,#00ff88,#00cc66)',marginTop:'10px',fontSize:'13px'})} onClick={()=>setMembers(p=>p.map(x=>x.id===progMember.id?{...x,diet:progMember.diet}:x))}>💾 الخطة محفوظة تلقائياً</button>
              </div>

              {/* Training Plan Card */}
              <div style={{...card({border:'1px solid rgba(0,229,255,0.2)',background:'linear-gradient(145deg,#090d10,#0d1318)'})}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'18px'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'linear-gradient(135deg,#00e5ff22,#00e5ff44)',border:'1px solid rgba(0,229,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>⚡</div>
                  <div>
                    <div style={{color:'#00e5ff',fontWeight:900,fontFamily:ff,fontSize:'16px'}}>برنامج التدريب المفصّل</div>
                    <div style={{color:'#1a3a5a',fontSize:'11px',fontFamily:fo}}>GYM + EMS TRAINING PROGRAM</div>
                  </div>
                  <button onClick={()=>setMembers(p=>p.map(x=>x.id===progMember.id?{...x,train:''}:x))} style={{marginRight:'auto',background:'rgba(255,51,51,0.1)',color:'#ff3333',border:'1px solid rgba(255,51,51,0.2)',borderRadius:'8px',padding:'5px 12px',cursor:'pointer',fontFamily:ff,fontSize:'11px'}}>مسح</button>
                </div>
                <div style={{...inp,height:'auto',minHeight:'500px',maxHeight:'600px',overflowY:'auto',whiteSpace:'pre-wrap',lineHeight:2,fontSize:'12px',color:'#bbb',background:'#06090f',border:'1px solid rgba(0,229,255,0.1)'}}>{progMember.train}</div>
                <button style={btnN({background:'linear-gradient(135deg,#00e5ff,#0099bb)',color:'#000',marginTop:'10px',fontSize:'13px'})} onClick={()=>{}}>💾 الخطة محفوظة تلقائياً</button>
              </div>
            </div>
          )}
        </div>

        {/* ── BOOKING ── */}
        <div style={sec('book')}>
          <div style={card()}>
            <h3 style={{...h3s,display:'flex',alignItems:'center',gap:'10px'}}><span>📅</span>الحجز الذكي لجلسات EMS</h3>
            <div style={g3}>
              <div>
                <label style={lbl}>المشترك</label>
                <select style={inp} value={bookMid} onChange={e=>setBookMid(e.target.value)}><option value="">-- اختر مشترك --</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} (متبقي: {m.rem_sess} جلسة)</option>)}</select>
                {bookMember&&<div style={{marginTop:'8px',padding:'8px 12px',background:bookMember.rem_sess>0?'rgba(204,255,0,0.08)':'rgba(255,51,51,0.08)',borderRadius:'8px',border:`1px solid ${bookMember.rem_sess>0?'rgba(204,255,0,0.2)':'rgba(255,51,51,0.2)'}`}}>
                  <span style={{color:'#777',fontSize:'12px',fontFamily:ff}}>الجلسات المتبقية: </span>
                  <span style={{color:bookMember.rem_sess>0?'#ccff00':'#ff3333',fontWeight:900,fontFamily:fo}}>{bookMember.rem_sess}</span>
                </div>}
              </div>
              <div><label style={lbl}>تاريخ ووقت الحجز</label><input style={inp} type="datetime-local" value={bookDate} onChange={e=>setBookDate(e.target.value)}/></div>
              <div>
                <label style={lbl}>البدلة المتاحة</label>
                <select style={inp} value={bookSuit} onChange={e=>setBookSuit(e.target.value)}>
                  <option value="">-- اختر البدلة --</option>
                  {suits.filter(s=>s.status!=='broken').map(s=>(
                    <option key={s.id} value={s.id} disabled={todayBookedSuits.has(s.id)&&s.status==='booked'}>
                      بدلة {s.id} [{s.size}] {todayBookedSuits.has(s.id)&&s.status==='booked'?'— محجوز اليوم':s.status==='broken'?'— معطلة':'— متاحة'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button style={btnN()} onClick={confirmBook}>⚡ تثبيت الموعد وخصم جلسة</button>
          </div>

          {/* Bookings List */}
          {bookings.length>0&&(
            <div style={card()}>
              <h3 style={h3s}>📋 سجل الحجوزات وإلغاؤها</h3>
              <div style={{display:'grid',gap:'10px'}}>
                {[...bookings].reverse().map(b=>{
                  const isToday=b.time.slice(0,10)===TODAY;
                  const isPast=b.time.slice(0,10)<TODAY;
                  return(
                    <div key={b.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'12px',background:isToday?'rgba(0,229,255,0.06)':isPast?'rgba(255,255,255,0.02)':'rgba(204,255,0,0.04)',border:`1px solid ${isToday?'rgba(0,229,255,0.2)':isPast?'#1a1a1a':'rgba(204,255,0,0.15)'}`}}>
                      <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'#0d0d0d',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>{isToday?'📍':isPast?'✅':'📅'}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:'#fff',fontWeight:700,fontFamily:ff,fontSize:'13px'}}>{b.mName}</div>
                        <div style={{color:'#555',fontSize:'11px',fontFamily:ff}}>{b.time.replace('T',' ')} | بدلة {b.suitId} [{b.suitSize}]</div>
                      </div>
                      <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                        {isToday&&<span style={{background:'rgba(0,229,255,0.15)',color:'#00e5ff',borderRadius:'20px',padding:'3px 10px',fontSize:'10px',fontFamily:ff,fontWeight:700}}>اليوم</span>}
                        {isPast&&<span style={{background:'rgba(255,255,255,0.05)',color:'#444',borderRadius:'20px',padding:'3px 10px',fontSize:'10px',fontFamily:ff}}>منتهي</span>}
                        {!isPast&&<button onClick={()=>cancelBooking(b.id)} style={{background:'rgba(255,51,51,0.1)',color:'#ff3333',border:'1px solid rgba(255,51,51,0.25)',padding:'5px 12px',borderRadius:'8px',cursor:'pointer',fontFamily:ff,fontWeight:700,fontSize:'11px'}}>إلغاء</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── STAFF ── */}
        <div style={sec('staff')}>
          <div style={card()}>
            <h3 style={h3s}>👔 إدارة الطاقم</h3>
            <div style={g3}>
              <div><label style={lbl}>اسم الموظف</label><input style={inp} type="text" value={sName} onChange={e=>setSName(e.target.value)} placeholder="الاسم الكامل"/></div>
              <div><label style={lbl}>الراتب (₪)</label><input style={inp} type="number" value={sSal} onChange={e=>setSSal(e.target.value)} placeholder="0"/></div>
              <div><label style={lbl}>المهمة</label><input style={inp} type="text" value={sTask} onChange={e=>setSTask(e.target.value)} placeholder="مدرب، مستقبل..."/></div>
            </div>
            <button style={btnN()} onClick={addStaff}>➕ إضافة موظف</button>
          </div>
          {staff.length>0&&<div style={card()}><h3 style={h3s}>📋 الطاقم</h3>
            <Tbl heads={['الموظف','المهمة','الراتب','السلف','الصافي','إجراء']} rows={staff.map(x=>[
              x.name,x.task,
              <span style={{color:'#00ff88',fontFamily:fo}}>{x.salary} ₪</span>,
              <span style={{color:'#ff3333',fontFamily:fo}}>{x.loans} ₪</span>,
              <span style={{color:'#ccff00',fontFamily:fo,fontWeight:900}}>{x.salary-x.loans} ₪</span>,
              <button onClick={()=>addLoan(x.id)} style={{background:'rgba(255,51,51,0.12)',color:'#ff3333',border:'1px solid rgba(255,51,51,0.25)',padding:'5px 14px',borderRadius:'8px',cursor:'pointer',fontFamily:ff,fontWeight:700,fontSize:'12px'}}>سلفة</button>
            ])}/>
          </div>}
        </div>

        {/* ── FINANCE ── */}
        <div style={sec('fin')}>
          {/* Summary Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'14px',marginBottom:'18px'}} className="no-print">
            {[{l:'إجمالي الدخل',v:finInc,c:'#00ff88',ic:'📈'},{l:'إجمالي الصرف',v:finExp,c:'#ff3333',ic:'📉'},{l:'صافي الربح',v:finInc-finExp,c:'#ccff00',ic:'💰'},{l:'عدد المعاملات',v:finance.length,c:'#00e5ff',ic:'📊'}].map(s=>(
              <div key={s.l} style={{...card({textAlign:'center',border:`1px solid ${s.c}22`,marginBottom:0,padding:'18px'})}}>
                <div style={{fontSize:'22px'}}>{s.ic}</div>
                <div style={{color:'#555',fontSize:'10px',fontFamily:ff,margin:'4px 0'}}>{s.l}</div>
                <div style={{color:s.c,fontSize:'22px',fontWeight:900,fontFamily:fo}}>{typeof s.v==='number'?s.v.toFixed(0):s.v} {typeof s.v==='number'&&s.l!=='عدد المعاملات'?'₪':''}</div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div style={card()} className="no-print">
            <h3 style={h3s}>📊 التحليل المالي البياني</h3>
            <BarChart income={finInc} expense={finExp}/>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'10px',marginTop:'14px'}}>
              {[...new Set(finance.map(f=>f.cat))].map(cat=>{
                const catInc=finance.filter(f=>f.type==='in'&&f.cat===cat).reduce((a,b)=>a+b.amt,0);
                const catExp=finance.filter(f=>f.type==='out'&&f.cat===cat).reduce((a,b)=>a+b.amt,0);
                return(
                  <div key={cat} style={{background:'#0a0a0a',borderRadius:'10px',padding:'10px',border:'1px solid #1c1c1c',fontSize:'12px'}}>
                    <div style={{color:'#777',fontFamily:ff,marginBottom:'4px'}}>{cat}</div>
                    {catInc>0&&<div style={{color:'#00ff88',fontFamily:fo,fontSize:'11px'}}>دخل: {catInc.toFixed(0)} ₪</div>}
                    {catExp>0&&<div style={{color:'#ff3333',fontFamily:fo,fontSize:'11px'}}>صرف: {catExp.toFixed(0)} ₪</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add/Edit Transaction */}
          <div style={card()} className="no-print">
            <h3 style={h3s}>{editFinId!==null?'✏️ تعديل معاملة':'➕ تسجيل معاملة جديدة'}</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'14px'}}>
              <div>
                <label style={lbl}>النوع</label>
                <select style={inp} value={fType} onChange={e=>setFType(e.target.value as 'in'|'out')}>
                  <option value="in">💰 دخل</option>
                  <option value="out">💸 صرف</option>
                </select>
              </div>
              <div>
                <label style={lbl}>التصنيف</label>
                <select style={inp} value={fCat} onChange={e=>setFCat(e.target.value)}>
                  {['اشتراكات','مكملات','رواتب وسلف','إيجار','معدات','صيانة','كهرباء وماء','تسويق','أخرى','عام'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>البيان</label><input style={inp} type="text" placeholder="وصف المعاملة" value={fDesc} onChange={e=>setFDesc(e.target.value)}/></div>
              <div><label style={lbl}>المبلغ (₪)</label><input style={inp} type="number" placeholder="0" value={fAmt} onChange={e=>setFAmt(e.target.value)}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'14px'}}>
              <button style={btnN({flex:1,marginTop:0})} onClick={saveFinance}>{editFinId!==null?'✅ حفظ التعديل':'⚡ تسجيل'}</button>
              {editFinId!==null&&<button style={{...btnN({flex:1,marginTop:0}),background:'#222',color:'#fff',boxShadow:'none'}} onClick={()=>{setEditFinId(null);setFDesc('');setFAmt('');setFCat('عام');}}>إلغاء</button>}
            </div>
          </div>

          {/* Income Table */}
          {finance.filter(x=>x.type==='in').length>0&&(
            <div style={card()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <h3 style={{...h3s,marginBottom:0,color:'#00ff88'}}>📈 تفاصيل الدخل — إجمالي: <span style={{fontFamily:fo}}>{finInc.toFixed(0)} ₪</span></h3>
                <button onClick={()=>window.print()} className="no-print" style={{background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'8px 18px',borderRadius:'8px',fontWeight:900,cursor:'pointer',fontFamily:ff,fontSize:'12px'}}>🖨️ طباعة</button>
              </div>
              <Tbl heads={['التاريخ','البيان','التصنيف','المبلغ','إجراء']} rows={[...finance].filter(x=>x.type==='in').reverse().map(x=>[
                <span style={{color:'#444',fontSize:'11px',fontFamily:ff}}>{x.date}</span>,
                x.desc,
                <span style={{background:'rgba(0,255,136,0.1)',color:'#00ff88',padding:'2px 8px',borderRadius:'10px',fontSize:'10px',fontFamily:ff}}>{x.cat}</span>,
                <span style={{color:'#00ff88',fontWeight:900,fontFamily:fo}}>{x.amt} ₪</span>,
                <div style={{display:'flex',gap:'6px'}}>
                  <button onClick={()=>editFin(x)} className="no-print" style={{background:'rgba(204,255,0,0.1)',color:'#ccff00',border:'1px solid rgba(204,255,0,0.2)',padding:'3px 10px',borderRadius:'6px',cursor:'pointer',fontFamily:ff,fontSize:'11px'}}>تعديل</button>
                  <button onClick={()=>deleteFin(x.id)} className="no-print" style={{background:'rgba(255,51,51,0.1)',color:'#ff3333',border:'1px solid rgba(255,51,51,0.2)',padding:'3px 10px',borderRadius:'6px',cursor:'pointer',fontFamily:ff,fontSize:'11px'}}>حذف</button>
                </div>
              ])}/>
            </div>
          )}

          {/* Expense Table */}
          {finance.filter(x=>x.type==='out').length>0&&(
            <div style={card()}>
              <h3 style={{...h3s,color:'#ff3333'}}>📉 تفاصيل الصرف — إجمالي: <span style={{fontFamily:fo}}>{finExp.toFixed(0)} ₪</span></h3>
              <Tbl heads={['التاريخ','البيان','التصنيف','المبلغ','إجراء']} rows={[...finance].filter(x=>x.type==='out').reverse().map(x=>[
                <span style={{color:'#444',fontSize:'11px',fontFamily:ff}}>{x.date}</span>,
                x.desc,
                <span style={{background:'rgba(255,51,51,0.1)',color:'#ff3333',padding:'2px 8px',borderRadius:'10px',fontSize:'10px',fontFamily:ff}}>{x.cat}</span>,
                <span style={{color:'#ff3333',fontWeight:900,fontFamily:fo}}>{x.amt} ₪</span>,
                <div style={{display:'flex',gap:'6px'}}>
                  <button onClick={()=>editFin(x)} className="no-print" style={{background:'rgba(204,255,0,0.1)',color:'#ccff00',border:'1px solid rgba(204,255,0,0.2)',padding:'3px 10px',borderRadius:'6px',cursor:'pointer',fontFamily:ff,fontSize:'11px'}}>تعديل</button>
                  <button onClick={()=>deleteFin(x.id)} className="no-print" style={{background:'rgba(255,51,51,0.1)',color:'#ff3333',border:'1px solid rgba(255,51,51,0.2)',padding:'3px 10px',borderRadius:'6px',cursor:'pointer',fontFamily:ff,fontSize:'11px'}}>حذف</button>
                </div>
              ])}/>
            </div>
          )}
        </div>

        {/* ── OFFERS ── */}
        <div style={sec('off')}>
          <div style={card()}>
            <h3 style={h3s}>🎁 إدارة العروض</h3>
            <div style={g3}>
              <div><label style={lbl}>اسم العرض</label><input style={inp} type="text" placeholder="اسم الباقة" value={oName} onChange={e=>setOName(e.target.value)}/></div>
              <div><label style={lbl}>السعر (₪)</label><input style={inp} type="number" placeholder="0" value={oPrice} onChange={e=>setOPrice(e.target.value)}/></div>
              <div><label style={lbl}>عدد الجلسات</label><input style={inp} type="number" placeholder="0" value={oSess} onChange={e=>setOSess(e.target.value)}/></div>
            </div>
            <button style={btnN()} onClick={addOffer}>➕ إضافة عرض</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px'}}>
            {offers.map(o=>(
              <div key={o.id} style={{...card({textAlign:'center',position:'relative',marginBottom:0,border:'1px solid rgba(204,255,0,0.15)'})}}>
                <div style={{position:'absolute',top:'12px',left:'12px',background:'rgba(204,255,0,0.1)',border:'1px solid rgba(204,255,0,0.3)',borderRadius:'6px',padding:'3px 8px',fontSize:'10px',color:'#ccff00',fontFamily:fo}}>EMS</div>
                <div style={{fontSize:'17px',fontWeight:900,fontFamily:ff,marginBottom:'8px',marginTop:'8px'}}>{o.name}</div>
                <div style={{fontSize:'34px',fontWeight:900,color:'#ccff00',fontFamily:fo,lineHeight:1}}>{o.price}</div>
                <div style={{color:'#555',fontSize:'11px',marginBottom:'4px',fontFamily:ff}}>شيقل</div>
                <div style={{display:'inline-block',background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.25)',borderRadius:'20px',padding:'4px 14px',color:'#00e5ff',fontSize:'12px',fontFamily:ff,marginBottom:'14px'}}>{o.sess} جلسة</div>
                <button onClick={()=>delOffer(o.id)} style={{display:'block',width:'100%',background:'rgba(255,51,51,0.08)',color:'#ff3333',border:'1px solid rgba(255,51,51,0.2)',padding:'7px',borderRadius:'8px',cursor:'pointer',fontFamily:ff,fontWeight:700,fontSize:'12px'}}>حذف</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── PORTFOLIO ── */}
        <div style={sec('port')}>
          <div style={card()} className="no-print">
            <h3 style={h3s}>📂 الملف الشامل للمشترك</h3>
            <div style={{display:'flex',gap:'14px',alignItems:'flex-end',flexWrap:'wrap'}}>
              <div style={{flex:1}}><label style={lbl}>اختر المشترك</label><select style={inp} value={portMid} onChange={e=>setPortMid(e.target.value)}><option value="">-- اختر --</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              {portMember&&<button onClick={()=>window.print()} style={{background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'12px 22px',borderRadius:'10px',fontWeight:900,cursor:'pointer',fontFamily:ff,whiteSpace:'nowrap',boxShadow:'0 4px 14px rgba(204,255,0,0.3)'}}>🖨️ طباعة الملف</button>}
            </div>
          </div>

          {/* Progress Photos Upload */}
          {portMember&&(
            <div style={card()} className="no-print">
              <h3 style={h3s}>📸 صور التطور</h3>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'flex-end'}}>
                <div style={{flex:1,minWidth:'200px'}}><label style={lbl}>ملاحظة الصورة</label><input style={inp} type="text" placeholder="وصف الصورة (مثال: أسبوع 4، بعد الجلسة 10...)" value={progPhotoNote} onChange={e=>setProgPhotoNote(e.target.value)}/></div>
                <button onClick={()=>progPhotoRef.current?.click()} style={{...btnN({width:'auto',marginTop:0,padding:'12px 20px'})}}>📷 رفع صورة تطور</button>
                <input ref={progPhotoRef} type="file" accept="image/*" hidden onChange={handleProgPhoto}/>
              </div>
              {portMember.photos?.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'12px',marginTop:'16px'}}>
                  {[...portMember.photos].reverse().map((p,i)=>(
                    <div key={i} style={{borderRadius:'12px',overflow:'hidden',border:'1px solid #1c1c1c',position:'relative'}}>
                      <img src={p.img} alt={p.note} style={{width:'100%',height:'140px',objectFit:'cover',display:'block'}}/>
                      <div style={{padding:'6px 8px',background:'#0d0d0d'}}>
                        <div style={{color:'#ccff00',fontSize:'9px',fontFamily:fo}}>{p.date.slice(0,16)}</div>
                        {p.note&&<div style={{color:'#666',fontSize:'10px',fontFamily:ff,marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.note}</div>}
                      </div>
                      <button onClick={()=>setMembers(prev=>prev.map(m=>m.id===portMember.id?{...m,photos:m.photos.filter((_,idx)=>idx!==portMember.photos.length-1-i)}:m))} style={{position:'absolute',top:'4px',left:'4px',background:'rgba(0,0,0,0.7)',color:'#ff3333',border:'none',borderRadius:'50%',width:'22px',height:'22px',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {portMember&&(
            <div className="print-zone" style={{background:'#fff',color:'#000',borderRadius:'18px',overflow:'hidden',padding:'36px',border:'2px solid #eee',direction:'rtl',fontFamily:ff}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px',borderBottom:'4px solid #ccff00',paddingBottom:'18px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                  <img src={logoImg} alt="Logo" style={{width:'60px',height:'60px',borderRadius:'50%',objectFit:'cover',border:'3px solid #ccff00'}}/>
                  <div>
                    <div style={{fontFamily:fo,fontSize:'20px',fontWeight:900,color:'#000'}}>SMART SPORT LAND</div>
                    <div style={{color:'#888',fontSize:'11px',fontFamily:fo,letterSpacing:'2px'}}>EMS TRAINING · NABLUS · PALESTINE</div>
                  </div>
                </div>
                <img src={portMember.img||logoImg} style={{width:'110px',height:'110px',borderRadius:'12px',objectFit:'cover',border:'3px solid #000'}} alt=""/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px',marginBottom:'22px'}}>
                <div>
                  {[['الاسم',portMember.name],['الهدف',portMember.goal],['المدرب',portMember.coach],portMember.chronic&&['أمراض',portMember.chronic],portMember.bone&&['إصابات',portMember.bone],['تاريخ التسجيل',portMember.date]].filter(Boolean).map((r,i)=>r&&<p key={i} style={{margin:'5px 0',fontFamily:ff}}><b>{(r as string[])[0]}:</b> {(r as string[])[1]}</p>)}
                </div>
                <div style={{background:'#f8f8f8',padding:'14px',borderRadius:'10px'}}>
                  <p style={{margin:'5px 0',fontFamily:ff}}><b>الجلسات المتبقية:</b> <span style={{color:'#00a',fontWeight:900,fontSize:'16px'}}>{portMember.rem_sess}</span></p>
                  <p style={{margin:'5px 0',fontFamily:ff}}><b>الدين:</b> <span style={{color:'#c00',fontWeight:900,fontSize:'16px'}}>{portMember.debt} ₪</span></p>
                  <p style={{margin:'5px 0',fontFamily:ff}}><b>المدفوع:</b> {portMember.paid} ₪</p>
                  <p style={{margin:'5px 0',fontFamily:ff}}><b>الباقة:</b> {portMember.total} ₪</p>
                </div>
              </div>
              <hr style={{border:'1px solid #eee',margin:'18px 0'}}/>
              <h3 style={{borderRight:'5px solid #ccff00',paddingRight:'10px',fontFamily:ff}}>📏 القياسات</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'8px',marginBottom:'18px'}}>
                {[{l:'الوزن',v:portMember.lab.w?portMember.lab.w+' كغم':'-'},{l:'الطول',v:portMember.lab.h?portMember.lab.h+' سم':'-'},{l:'الرقبة',v:portMember.lab.neck?portMember.lab.neck+' سم':'-'},{l:'الخصر',v:portMember.lab.waist?portMember.lab.waist+' سم':'-'},{l:'الصدر',v:portMember.lab.chest?portMember.lab.chest+' سم':'-'},{l:'الأرداف',v:portMember.lab.hips?portMember.lab.hips+' سم':'-'},{l:'الدهون',v:portMember.lab.fat||'-'},{l:'BMI',v:portMember.lab.bmi||'-'},{l:'العضل',v:portMember.lab.mus||'-'},{l:'الذراع ي',v:portMember.lab.armR?portMember.lab.armR+' سم':'-'}].map((it,i)=>(
                  <div key={i} style={{background:'#f5f5f5',padding:'8px',borderRadius:'8px',textAlign:'center'}}><div style={{fontSize:'10px',color:'#888'}}>{it.l}</div><div style={{fontWeight:'bold',marginTop:'3px',fontSize:'12px'}}>{it.v}</div></div>
                ))}
              </div>
              {portMember.history?.length>0&&<><hr style={{border:'1px solid #eee',margin:'18px 0'}}/><h3 style={{borderRight:'5px solid #ccff00',paddingRight:'10px',fontFamily:ff}}>📜 سجل التطور</h3><table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}><thead><tr style={{background:'#f0f0f0'}}>{['التاريخ','الوزن','الرقبة','الخصر','الأرداف','الدهون','BMI'].map(h=><th key={h} style={{padding:'7px',textAlign:'right',border:'1px solid #ddd',fontFamily:ff}}>{h}</th>)}</tr></thead><tbody>{[...portMember.history].reverse().map((h,i)=><tr key={i}>{[h.date,h.w,h.neck||'-',h.waist,h.hips||'-',h.fat,h.bmi].map((v,j)=><td key={j} style={{padding:'7px',border:'1px solid #eee',fontFamily:ff}}>{v}</td>)}</tr>)}</tbody></table></>}
              {portMember.photos?.length>0&&<><hr style={{border:'1px solid #eee',margin:'18px 0'}}/><h3 style={{borderRight:'5px solid #00ff88',paddingRight:'10px',fontFamily:ff}}>📸 صور التطور</h3><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>{portMember.photos.map((p,i)=><div key={i} style={{textAlign:'center'}}><img src={p.img} alt="" style={{width:'100%',height:'90px',objectFit:'cover',borderRadius:'8px',border:'1px solid #eee'}}/><div style={{fontSize:'9px',color:'#888',marginTop:'3px'}}>{p.date.slice(0,16)}</div><div style={{fontSize:'9px',color:'#555'}}>{p.note}</div></div>)}</div></>}
              <hr style={{border:'1px solid #eee',margin:'18px 0'}}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'22px'}}>
                <div><h4 style={{fontFamily:ff,borderRight:'3px solid #00ff88',paddingRight:'8px'}}>🥗 خطة التغذية</h4><p style={{whiteSpace:'pre-wrap',background:'#f8f8f8',padding:'12px',borderRadius:'8px',fontSize:'11px',fontFamily:ff}}>{portMember.diet||'لم تُحدَّد خطة'}</p></div>
                <div><h4 style={{fontFamily:ff,borderRight:'3px solid #00e5ff',paddingRight:'8px'}}>⚡ خطة التدريب</h4><p style={{whiteSpace:'pre-wrap',background:'#f8f8f8',padding:'12px',borderRadius:'8px',fontSize:'11px',fontFamily:ff}}>{portMember.train||'لم تُحدَّد خطة'}</p></div>
              </div>
              <div style={{marginTop:'20px',borderTop:'2px solid #ccff00',paddingTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:'10px',color:'#aaa',fontFamily:fo}}>SMART SPORT LAND © 2025</div>
                <div style={{fontSize:'10px',color:'#aaa',fontFamily:ff}}>نابلس · فلسطين</div>
              </div>
            </div>
          )}
        </div>

      </div>
      {toast&&<div style={{position:'fixed',bottom:'28px',left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',padding:'13px 26px',borderRadius:'28px',fontWeight:900,zIndex:9999,boxShadow:'0 6px 28px rgba(204,255,0,0.5)',fontSize:'14px',fontFamily:ff,whiteSpace:'nowrap',direction:'rtl'}}>{toast}</div>}
    </div>
  );
}
