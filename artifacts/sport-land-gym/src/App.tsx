import { useState, useEffect, useRef, useCallback } from "react";
import logoImg from "/logo.png";
import heroBg from "/hero-bg.png";

/* ─────────────── TYPES ─────────────── */
type Screen = 'landing' | 'admin';
type Section = 'dash' | 'reg' | 'lab' | 'prog' | 'book' | 'staff' | 'fin' | 'off' | 'port';

interface LabData { h:string;w:string;age?:string;chest:string;waist:string;hips:string;thighR:string;thighL:string;armR:string;armL:string;bmi?:string;fat?:string;mus?:string; }
interface HistoryEntry extends LabData { date:string; }
interface Member { id:number;name:string;addr:string;goal:string;chronic:string;bone:string;total:number;paid:number;debt:number;rem_sess:number;coach:string;img:string;lab:LabData;history:HistoryEntry[];diet:string;train:string;date:string; }
interface Staff { id:number;name:string;salary:number;task:string;loans:number; }
interface Offer { id:number;name:string;price:number;sess:number; }
interface Finance { date:string;desc:string;amt:number;type:'in'|'out'; }
interface Booking { mName:string;time:string;suitId:number;suitSize:string; }
interface Suit { id:number;size:string;status:'avail'|'booked'|'broken'; }

/* ─────────────── DATA ─────────────── */
const DEFAULT_SUITS:Suit[] = [
  {id:1,size:'S',status:'avail'},{id:2,size:'S',status:'avail'},
  {id:3,size:'M',status:'avail'},{id:4,size:'M',status:'avail'},
  {id:5,size:'L',status:'avail'},{id:6,size:'L',status:'avail'},
  {id:7,size:'XL',status:'avail'},{id:8,size:'XL',status:'avail'},
  {id:9,size:'XXL',status:'avail'},{id:10,size:'XXL',status:'avail'}
];
const DEFAULT_OFFERS:Offer[] = [{id:1,name:'باقة الافتتاح',price:500,sess:12}];
const EMPTY_LAB:LabData = {h:'',w:'',chest:'',waist:'',hips:'',thighR:'',thighL:'',armR:'',armL:''};
const MOTTOS = ['⚡ قوّتك الحقيقية تبدأ من هنا','🔥 اليوم أقوى من أمس','💪 EMS — الذكاء في خدمة جسمك','🎯 كل جلسة خطوة نحو الكمال','🚀 ٢٠ دقيقة تساوي ساعتين تقليديتين','⭐ المثابرة هي سر كل بطل'];

function ls<T>(k:string,fb:T):T { try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;} }
function sv(k:string,v:unknown){localStorage.setItem(k,JSON.stringify(v));}

/* ─────────────── SHARED UI ─────────────── */
const ff = "'Cairo', 'Tajawal', sans-serif";
const fo = "'Orbitron', monospace";

const inp:React.CSSProperties = {background:'#080808',border:'1px solid #252525',color:'#fff',padding:'12px 14px',borderRadius:'10px',width:'100%',marginTop:'8px',outline:'none',fontSize:'14px',fontFamily:ff};
const lbl:React.CSSProperties = {color:'#666',fontSize:'12px',fontWeight:600,fontFamily:ff};
const card = (extra?:React.CSSProperties):React.CSSProperties => ({background:'linear-gradient(145deg,#0d0d0d,#131313)',border:'1px solid #1c1c1c',padding:'24px',borderRadius:'18px',marginBottom:'18px',boxShadow:'0 8px 32px rgba(0,0,0,0.6)',...extra});
const g3:React.CSSProperties = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'18px'};
const g4:React.CSSProperties = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'14px'};
const btnN = (extra?:React.CSSProperties):React.CSSProperties => ({background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'14px',borderRadius:'12px',fontWeight:900,cursor:'pointer',width:'100%',marginTop:'14px',fontSize:'15px',fontFamily:ff,boxShadow:'0 4px 18px rgba(204,255,0,0.3)',...extra});
const btnA = (extra?:React.CSSProperties):React.CSSProperties => ({background:'linear-gradient(135deg,#00e5ff,#0099bb)',color:'#000',border:'none',padding:'12px',borderRadius:'12px',fontWeight:900,cursor:'pointer',width:'100%',marginTop:'14px',fontSize:'14px',fontFamily:ff,boxShadow:'0 4px 18px rgba(0,229,255,0.3)',...extra});
const h3s:React.CSSProperties = {color:'#fff',marginTop:0,marginBottom:'18px',fontFamily:ff,fontWeight:700,fontSize:'18px'};
const h4n:React.CSSProperties = {color:'#ccff00',marginTop:'22px',borderBottom:'1px solid #1c1c1c',paddingBottom:'8px',fontFamily:ff,fontWeight:700};
const h4a:React.CSSProperties = {color:'#00e5ff',marginTop:'22px',borderBottom:'1px solid #1c1c1c',paddingBottom:'8px',fontFamily:ff,fontWeight:700};

/* ─────────────── TABLE ─────────────── */
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

/* ═══════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════ */
export default function App() {
  /* state */
  const [screen,setScreen] = useState<Screen>('landing');
  const [section,setSection] = useState<Section>('dash');
  const [members,setMembers]   = useState<Member[]>(()=>ls('sl_m_v4',[]));
  const [staff,setStaff]       = useState<Staff[]>(()=>ls('sl_s_v4',[]));
  const [offers,setOffers]     = useState<Offer[]>(()=>ls('sl_o_v4',DEFAULT_OFFERS));
  const [finance,setFinance]   = useState<Finance[]>(()=>ls('sl_f_v4',[]));
  const [bookings,setBookings] = useState<Booking[]>(()=>ls('sl_b_v4',[]));
  const [suits,setSuits]       = useState<Suit[]>(()=>ls('sl_suits_v4',DEFAULT_SUITS));
  const [toast,setToast]       = useState('');
  const [motoIdx,setMotoIdx]   = useState(0);
  const [sidebarOpen,setSidebarOpen] = useState(true);
  const [ticker,setTicker]     = useState(0); // for heartbeat animation

  /* forms */
  const [regImg,setRegImg]=useState('');const [regName,setRegName]=useState('');const [regAddr,setRegAddr]=useState('');
  const [regGoal,setRegGoal]=useState('تنشيف دهون');const [regChronic,setRegChronic]=useState('');const [regBone,setRegBone]=useState('');
  const [regOfferId,setRegOfferId]=useState<number|null>(null);const [regPaid,setRegPaid]=useState('');const [regCoach,setRegCoach]=useState('');
  const imgRef=useRef<HTMLInputElement>(null);
  const [labMid,setLabMid]=useState('');const [labData,setLabData]=useState<LabData>(EMPTY_LAB);const [labAge,setLabAge]=useState('');
  const [progMid,setProgMid]=useState('');const [diet,setDiet]=useState('');const [train,setTrain]=useState('');
  const [bookMid,setBookMid]=useState('');const [bookDate,setBookDate]=useState('');const [bookSuit,setBookSuit]=useState('');
  const [sName,setSName]=useState('');const [sSal,setSSal]=useState('');const [sTask,setSTask]=useState('');
  const [fDesc,setFDesc]=useState('');const [fAmt,setFAmt]=useState('');
  const [oName,setOName]=useState('');const [oPrice,setOPrice]=useState('');const [oSess,setOSess]=useState('');
  const [portMid,setPortMid]=useState('');

  /* persist */
  useEffect(()=>{sv('sl_m_v4',members);},[members]);
  useEffect(()=>{sv('sl_s_v4',staff);},[staff]);
  useEffect(()=>{sv('sl_o_v4',offers);},[offers]);
  useEffect(()=>{sv('sl_f_v4',finance);},[finance]);
  useEffect(()=>{sv('sl_b_v4',bookings);},[bookings]);
  useEffect(()=>{sv('sl_suits_v4',suits);},[suits]);
  useEffect(()=>{if(offers.length&&regOfferId===null)setRegOfferId(offers[0].id);},[offers]);

  /* timers */
  useEffect(()=>{const t=setInterval(()=>setMotoIdx(i=>(i+1)%MOTTOS.length),4000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const t=setInterval(()=>setTicker(i=>i+1),100);return()=>clearInterval(t);},[]);

  const showToast=useCallback((msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000);},[]);

  /* computed */
  const selOffer=offers.find(o=>o.id===regOfferId);
  const regDebt=selOffer?(selOffer.price-(parseFloat(regPaid)||0)):0;
  const aiStats=(()=>{const h=parseFloat(labData.h)/100,w=parseFloat(labData.w);if(h>0&&w>0){const b=(w/(h*h)).toFixed(1);return{bmi:b,fat:(parseFloat(b)*1.2).toFixed(1)+'%',mus:(100-parseFloat(b)*1.2).toFixed(1)+'%'};}return{bmi:'-',fat:'-',mus:'-'};})();
  const finInc=finance.filter(x=>x.type==='in').reduce((a,b)=>a+b.amt,0);
  const finExp=finance.filter(x=>x.type==='out').reduce((a,b)=>a+b.amt,0);
  const portMember=members.find(x=>String(x.id)===portMid);
  const bookMember=members.find(x=>String(x.id)===bookMid);

  /* actions */
  function handleImg(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setRegImg(ev.target?.result as string);r.readAsDataURL(f);}

  function saveMember(){
    if(!regName.trim())return showToast('يرجى إدخال الاسم');
    if(!selOffer)return showToast('يرجى اختيار باقة');
    const m:Member={id:Date.now(),name:regName.trim(),addr:regAddr,goal:regGoal,chronic:regChronic,bone:regBone,total:selOffer.price,paid:parseFloat(regPaid)||0,debt:regDebt,rem_sess:selOffer.sess,coach:regCoach||(staff[0]?.name??''),img:regImg,lab:{...EMPTY_LAB},history:[],diet:'',train:'',date:new Date().toLocaleDateString('ar-EG')};
    setMembers(p=>[...p,m]);
    if(m.paid>0)setFinance(p=>[...p,{date:new Date().toLocaleString(),desc:`اشتراك: ${m.name}`,amt:m.paid,type:'in'}]);
    setRegName('');setRegAddr('');setRegChronic('');setRegBone('');setRegPaid('');setRegImg('');
    showToast('تمت الإضافة بنجاح ✅');setSection('dash');
  }

  function loadLab(id:string){setLabMid(id);const m=members.find(x=>String(x.id)===id);if(m){setLabData({...EMPTY_LAB,...m.lab});setLabAge(m.lab.age||'');}else setLabData(EMPTY_LAB);}
  function saveLab(){const m=members.find(x=>String(x.id)===labMid);if(!m)return showToast('اختر مشترك');const e:HistoryEntry={...labData,date:new Date().toLocaleDateString('ar-EG'),...aiStats};setMembers(p=>p.map(x=>x.id===m.id?{...x,lab:{...labData,...aiStats},history:[...(x.history||[]),e]}:x));showToast('تم حفظ القياسات ✅');}
  function loadProg(id:string){setProgMid(id);const m=members.find(x=>String(x.id)===id);if(m){setDiet(m.diet);setTrain(m.train);}}
  function genProg(){const m=members.find(x=>String(x.id)===progMid);if(!m)return showToast('اختر مشترك');const c=(parseFloat(m.lab.w)||70)*25;setDiet(`خطة التغذية لـ ${m.name}:\n- السعرات: ${c} kcal\n- بروتين عالي لتناسب EMS\n- فطور: بيض + كربوهيدرات معقدة\n- غداء: بروتين حيواني + خضار\n- تحذير: ${m.chronic||'لا يوجد'}`);setTrain(`خطة EMS:\n- التردد: 85Hz\n- التركيز: ${m.bone||'كامل العضلات'}\n- الخصر الحالي: ${m.lab.waist}سم`);}
  function saveProg(){const m=members.find(x=>String(x.id)===progMid);if(!m)return showToast('اختر مشترك');setMembers(p=>p.map(x=>x.id===m.id?{...x,diet,train}:x));showToast('حُفظت الخطة ✅');}
  function confirmBook(){if(!bookMid||!bookSuit||!bookDate)return showToast('اكمل بيانات الحجز');const m=members.find(x=>String(x.id)===bookMid);if(!m)return;if(m.rem_sess<=0)return showToast('لا يوجد جلسات متبقية');const s=suits.find(x=>String(x.id)===bookSuit);if(!s)return;setMembers(p=>p.map(x=>x.id===m.id?{...x,rem_sess:x.rem_sess-1}:x));setSuits(p=>p.map(x=>String(x.id)===bookSuit?{...x,status:'booked'}:x));setBookings(p=>[...p,{mName:m.name,time:bookDate,suitId:s.id,suitSize:s.size}]);setBookMid('');setBookDate('');setBookSuit('');showToast('تم التثبيت ✅');}
  function toggleSuit(id:number){setSuits(p=>p.map(s=>s.id===id?{...s,status:s.status==='avail'?'broken':'avail'}:s));}
  function addStaff(){if(!sName.trim())return showToast('أدخل الاسم');setStaff(p=>[...p,{id:Date.now(),name:sName,salary:parseFloat(sSal)||0,task:sTask,loans:0}]);setSName('');setSSal('');setSTask('');showToast('تمت الإضافة');}
  function addLoan(id:number){const a=parseFloat(prompt('المبلغ:')||'0');if(!a)return;const s=staff.find(x=>x.id===id);if(!s)return;setStaff(p=>p.map(x=>x.id===id?{...x,loans:x.loans+a}:x));setFinance(p=>[...p,{date:new Date().toLocaleString(),desc:`سلفة: ${s.name}`,amt:a,type:'out'}]);showToast('سُجلت السلفة');}
  function addExp(){const a=parseFloat(fAmt);if(!a)return showToast('أدخل المبلغ');setFinance(p=>[...p,{date:new Date().toLocaleString(),desc:fDesc,amt:a,type:'out'}]);setFDesc('');setFAmt('');showToast('سُجل الصرف');}
  function addOffer(){if(!oName||!oPrice||!oSess)return showToast('اكمل البيانات');setOffers(p=>[...p,{id:Date.now(),name:oName,price:parseFloat(oPrice),sess:parseInt(oSess)}]);setOName('');setOPrice('');setOSess('');showToast('تمت الإضافة ✅');}
  function delOffer(id:number){if(!confirm('حذف هذا العرض؟'))return;setOffers(p=>p.filter(o=>o.id!==id));}

  const menuItems:{id:Section;icon:string;label:string}[] = [
    {id:'dash',icon:'📊',label:'الرادار الذكي'},{id:'reg',icon:'👤',label:'تسجيل عضو'},
    {id:'lab',icon:'🔬',label:'قياسات AI'},{id:'prog',icon:'🍎',label:'الغذاء والتدريب'},
    {id:'book',icon:'📅',label:'الحجز والمخزون'},{id:'staff',icon:'👔',label:'الموظفين'},
    {id:'fin',icon:'💰',label:'التقارير المالية'},{id:'off',icon:'🎁',label:'العروض'},
    {id:'port',icon:'📂',label:'الملف الشامل'},
  ];

  const sec=(id:Section):React.CSSProperties=>({display:section===id?'block':'none'});

  /* ━━━━━━━━━━━━ LANDING SCREEN ━━━━━━━━━━━━ */
  if(screen==='landing') return (
    <div style={{minHeight:'100vh',background:'#050505',fontFamily:ff,direction:'rtl',overflow:'hidden'}}>

      {/* NAV BAR */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',height:'64px',background:'rgba(0,0,0,0.9)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(204,255,0,0.15)'}}>
        {/* Logo + Name */}
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <img src={logoImg} alt="logo" style={{width:'38px',height:'38px',borderRadius:'50%',objectFit:'cover',border:'2px solid #ccff00'}}/>
          <div>
            <div style={{color:'#ccff00',fontFamily:fo,fontSize:'12px',fontWeight:900,letterSpacing:'1px'}}>SMART SPORT LAND</div>
            <div style={{color:'#444',fontSize:'9px',fontFamily:fo,letterSpacing:'2px'}}>EMS TECHNOLOGY</div>
          </div>
        </div>
        {/* Nav links - no duplicates */}
        <div style={{display:'flex',gap:'36px',alignItems:'center'}}>
          <span style={{color:'#ccff00',fontSize:'14px',cursor:'pointer',fontWeight:700,fontFamily:ff,borderBottom:'2px solid #ccff00',paddingBottom:'2px'}}>الرئيسية</span>
          <span style={{color:'#999',fontSize:'14px',cursor:'pointer',fontWeight:600,fontFamily:ff}} onClick={()=>setScreen('admin')}>الإدارة</span>
        </div>
        {/* CTA */}
        <button onClick={()=>setScreen('admin')} style={{background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'10px 22px',borderRadius:'8px',fontWeight:900,cursor:'pointer',fontFamily:ff,fontSize:'13px',boxShadow:'0 4px 20px rgba(204,255,0,0.35)'}}>
          ⚡ لوحة الإدارة
        </button>
      </nav>

      {/* HERO */}
      <div style={{position:'relative',height:'100vh',display:'flex',alignItems:'center',overflow:'hidden'}}>

        {/* BG image — heavily darkened + blurred so old-UI text is invisible */}
        <div style={{position:'absolute',inset:0,backgroundImage:`url(${heroBg})`,backgroundSize:'cover',backgroundPosition:'center 30%',backgroundRepeat:'no-repeat',filter:'brightness(0.07) blur(3px) saturate(2)',transform:'scale(1.05)'}}/>

        {/* Strong solid overlays */}
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.92) 70%, #000 100%)'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, #000 0%, transparent 50%)'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'120px',background:'linear-gradient(to bottom,#000,transparent)'}}/>
        {/* Neon tint */}
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 60% 50%, rgba(204,255,0,0.04) 0%, transparent 65%)'}}/>

        {/* Subtle grid */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(204,255,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(204,255,0,0.025) 1px,transparent 1px)',backgroundSize:'50px 50px',pointerEvents:'none'}}/>

        {/* ── HERO CONTENT ── */}
        <div style={{position:'relative',zIndex:10,padding:'80px 6% 120px',width:'100%',maxWidth:'680px',marginRight:'0'}}>

          {/* Badge */}
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(204,255,0,0.1)',border:'1px solid rgba(204,255,0,0.35)',borderRadius:'30px',padding:'5px 16px',marginBottom:'24px'}}>
            <span style={{color:'#ccff00',fontSize:'14px'}}>⚡</span>
            <span style={{color:'#ccff00',fontSize:'12px',fontWeight:700,fontFamily:ff}}>لياقة الجيل القادم</span>
          </div>

          {/* Headline */}
          <h1 style={{margin:'0 0 16px',lineHeight:1.05,fontFamily:ff,padding:0}}>
            <span style={{display:'block',color:'#ffffff',fontSize:'clamp(48px,7.5vw,84px)',fontWeight:900}}>٢٠ دقيقة.</span>
            <span style={{display:'block',color:'#ccff00',fontSize:'clamp(48px,7.5vw,84px)',fontWeight:900,textShadow:'0 0 50px rgba(204,255,0,0.4)'}}>أقصى تأثير.</span>
          </h1>

          {/* Sub-text */}
          <p style={{color:'rgba(255,255,255,0.7)',fontSize:'clamp(13px,1.6vw,17px)',lineHeight:1.9,margin:'0 0 32px',fontFamily:ff,maxWidth:'480px'}}>
            يُنشط تحفيز العضلات الكهربائي (EMS) 90% من ألياف عضلاتك في آن واحد.<br/>
            حقق في 20 دقيقة ما يستغرق ساعتين في صالة تقليدية.
          </p>

          {/* CTA */}
          <div style={{display:'flex',gap:'14px',flexWrap:'wrap'}}>
            <button onClick={()=>setScreen('admin')} style={{background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'15px 32px',borderRadius:'10px',fontWeight:900,cursor:'pointer',fontFamily:ff,fontSize:'15px',boxShadow:'0 6px 28px rgba(204,255,0,0.45)',display:'inline-flex',alignItems:'center',gap:'8px'}}>
              احجز جلسة تجريبية <span style={{fontSize:'18px'}}>←</span>
            </button>
            <button onClick={()=>{setSection('off');setScreen('admin');}} style={{background:'rgba(255,255,255,0.06)',color:'#fff',border:'1px solid rgba(255,255,255,0.25)',padding:'15px 32px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontFamily:ff,fontSize:'15px'}}>
              عرض العروض
            </button>
          </div>
        </div>

        {/* Heartbeat line */}
        <div style={{position:'absolute',bottom:'96px',left:0,right:0,zIndex:5,pointerEvents:'none',opacity:0.2}}>
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{width:'100%',height:'60px'}}>
            <path d="M0 30 L180 30 L220 30 L250 8 L290 52 L325 10 L358 30 L420 30 L480 30 L520 6 L555 54 L590 12 L622 30 L700 30 L900 30 L1200 30" stroke="#ccff00" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>

        {/* Motivational ticker */}
        <div style={{position:'absolute',bottom:'70px',left:'50%',transform:'translateX(-50%)',zIndex:10,display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{height:'1px',width:'50px',background:'rgba(204,255,0,0.35)'}}/>
          <span style={{color:'rgba(204,255,0,0.75)',fontSize:'12px',fontFamily:ff,fontWeight:600,whiteSpace:'nowrap'}}>{MOTTOS[motoIdx]}</span>
          <div style={{height:'1px',width:'50px',background:'rgba(204,255,0,0.35)'}}/>
        </div>

        {/* Stats strip */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(12px)',borderTop:'1px solid rgba(204,255,0,0.12)',padding:'14px 6%',display:'flex',gap:'40px',zIndex:10,flexWrap:'wrap',alignItems:'center'}}>
          {[
            {val:String(members.length),label:'مشترك نشط',col:'#ccff00'},
            {val:String(suits.filter(s=>s.status==='avail').length),label:'جهاز EMS متاح',col:'#00e5ff'},
            {val:String(bookings.length),label:'جلسة محجوزة',col:'#00ff88'},
            {val:'٢٠',label:'دقيقة للجلسة',col:'#ff69b4'},
          ].map(s=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{color:s.col,fontSize:'28px',fontWeight:900,fontFamily:fo,lineHeight:1}}>{s.val}</div>
              <div style={{color:'#666',fontSize:'11px',fontFamily:ff,lineHeight:1.3}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ━━━━━━━━━━━━ ADMIN SCREEN ━━━━━━━━━━━━ */
  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#060606',fontFamily:ff,direction:'rtl'}}>

      {/* ─── TOP NAV BAR ─── */}
      <div className="no-print" style={{position:'fixed',top:0,left:0,right:0,height:'52px',background:'rgba(0,0,0,0.95)',borderBottom:'1px solid #1a1a1a',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',zIndex:200,backdropFilter:'blur(10px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <img src={logoImg} alt="logo" style={{width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover',border:'1.5px solid #ccff00'}}/>
          <span style={{color:'#ccff00',fontFamily:fo,fontSize:'12px',fontWeight:900,letterSpacing:'1px'}}>SMART SPORT LAND</span>
          <span style={{color:'#333',fontSize:'12px',margin:'0 4px'}}>|</span>
          <span style={{color:'#555',fontSize:'11px',fontFamily:fo,letterSpacing:'1px'}}>ADMIN</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{color:'rgba(204,255,0,0.7)',fontSize:'12px',fontFamily:ff}}>{MOTTOS[motoIdx]}</span>
        </div>
        <button onClick={()=>setScreen('landing')} style={{background:'rgba(204,255,0,0.1)',color:'#ccff00',border:'1px solid rgba(204,255,0,0.3)',padding:'6px 16px',borderRadius:'8px',cursor:'pointer',fontFamily:ff,fontSize:'12px',fontWeight:700}}>
          ← الواجهة الرئيسية
        </button>
      </div>

      {/* ─── SIDEBAR ─── */}
      <div className="no-print" style={{width:sidebarOpen?'240px':'62px',background:'linear-gradient(180deg,#000,#080808)',borderLeft:'1px solid #141414',display:'flex',flexDirection:'column',padding:'68px 10px 16px',overflowY:'auto',transition:'width 0.25s ease',flexShrink:0,position:'relative'}}>
        {/* Toggle */}
        <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{position:'absolute',top:'60px',left:'8px',background:'#111',border:'1px solid #222',borderRadius:'8px',padding:'4px 8px',cursor:'pointer',color:'#555',fontSize:'14px'}}>
          {sidebarOpen?'◀':'▶'}
        </button>

        <nav style={{flex:1,marginTop:'20px'}}>
          {menuItems.map(item=>(
            <button key={item.id} onClick={()=>setSection(item.id)} style={{
              padding:sidebarOpen?'11px 14px':'11px',marginBottom:'4px',borderRadius:'10px',cursor:'pointer',
              color:section===item.id?'#000':'#777',fontWeight:section===item.id?900:600,
              border:'none',textAlign:'right' as const,
              background:section===item.id?'linear-gradient(135deg,#ccff00,#aae000)':'transparent',
              width:'100%',fontSize:'13px',display:'flex',alignItems:'center',gap:'10px',
              transition:'all 0.2s',fontFamily:ff,
              boxShadow:section===item.id?'0 3px 12px rgba(204,255,0,0.3)':'none',
            }}>
              <span style={{fontSize:'15px',flexShrink:0}}>{item.icon}</span>
              {sidebarOpen&&<span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Quick stats */}
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

      {/* ─── MAIN ─── */}
      <div style={{flex:1,overflowY:'auto',padding:'70px 24px 24px',background:'radial-gradient(ellipse at 30% 10%,#111 0%,#060606 70%)'}}>

        {/* === DASHBOARD === */}
        <div style={sec('dash')} className="section-animate">
          {/* Hero strip */}
          <div style={{position:'relative',borderRadius:'20px',overflow:'hidden',marginBottom:'20px',height:'200px'}}>
            <div style={{position:'absolute',inset:0,backgroundImage:`url(${heroBg})`,backgroundSize:'cover',backgroundPosition:'center top',filter:'brightness(0.3)'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to left,rgba(0,0,0,0.2),rgba(0,0,0,0.8))'}}/>
            <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(204,255,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(204,255,0,0.03) 1px,transparent 1px)',backgroundSize:'30px 30px'}}/>
            <div style={{position:'relative',zIndex:10,padding:'30px 36px',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{color:'#ccff00',fontSize:'10px',fontFamily:fo,letterSpacing:'3px',marginBottom:'8px',opacity:0.8}}>NABLUS · PALESTINE · EMS TRAINING</div>
              <div style={{fontFamily:fo,fontSize:'clamp(20px,3vw,32px)',fontWeight:900,background:'linear-gradient(135deg,#fff,#ccff00)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.1}}>SMART SPORT LAND</div>
              <div style={{display:'flex',gap:'20px',marginTop:'16px',flexWrap:'wrap'}}>
                {[{l:'أعضاء نشطين',v:members.length,c:'#ccff00'},{l:'أجهزة متاحة',v:suits.filter(s=>s.status==='avail').length,c:'#00e5ff'},{l:'جلسات محجوزة',v:bookings.length,c:'#00ff88'},{l:'ديون مفتوحة',v:members.filter(m=>m.debt>0).length,c:'#ff3333'}].map(s=>(
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
              <h3 style={{...h3s,color:'#00e5ff',display:'flex',alignItems:'center',gap:'8px'}}><span>📅</span>آخر الحجوزات</h3>
              <div style={{maxHeight:'160px',overflowY:'auto'}}>
                {bookings.length===0?<p style={{color:'#333',textAlign:'center',padding:'20px',fontFamily:ff}}>لا حجوزات</p>
                :[...bookings].reverse().slice(0,6).map((x,i)=>(
                  <div key={i} style={{padding:'8px 12px',background:'rgba(0,229,255,0.05)',borderRadius:'8px',marginBottom:'5px',borderRight:'3px solid #00e5ff',fontSize:'12px',fontFamily:ff}}>
                    <strong>{x.mName}</strong> | {x.time.replace('T',' ')} | بدلة {x.suitId}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={card()}>
            <h3 style={{...h3s,display:'flex',alignItems:'center',gap:'10px'}}><span>⚡</span>حالة أجهزة EMS الـ 10<span style={{fontSize:'12px',color:'#444',fontWeight:400}}>(اضغط لتغيير)</span></h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px'}}>
              {suits.map(suit=>{const cfg={avail:{c:'#00ff88',l:'متاح'},booked:{c:'#00e5ff',l:'محجوز'},broken:{c:'#ff3333',l:'معطل'}}[suit.status];return(
                <div key={suit.id} onClick={()=>toggleSuit(suit.id)} style={{padding:'14px 8px',borderRadius:'12px',border:`1px solid ${cfg.c}44`,textAlign:'center',cursor:'pointer',color:cfg.c,background:`${cfg.c}08`,opacity:suit.status==='broken'?0.5:1,transition:'all 0.2s'}}>
                  <div style={{fontSize:'15px',fontFamily:fo,fontWeight:900}}>{suit.size}</div>
                  <div style={{fontSize:'9px',marginTop:'3px',fontFamily:ff,opacity:0.8}}>{cfg.l}</div>
                  <div style={{fontSize:'9px',color:'#333',fontFamily:fo}}>#{suit.id}</div>
                </div>
              );})}
            </div>
          </div>
        </div>

        {/* === REGISTRATION === */}
        <div style={sec('reg')} className="section-animate">
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

        {/* === LAB === */}
        <div style={sec('lab')} className="section-animate">
          <div style={card()}>
            <h3 style={h3s}>🔬 تتبع القياسات — تحليل AI</h3>
            <select style={inp} value={labMid} onChange={e=>loadLab(e.target.value)}><option value="">-- اختر مشترك --</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <h4 style={h4n}>📏 القياسات الأساسية</h4>
            <div style={g3}>
              <div><label style={lbl}>الطول (سم)</label><input style={inp} type="number" placeholder="175" value={labData.h} onChange={e=>setLabData(p=>({...p,h:e.target.value}))}/></div>
              <div><label style={lbl}>الوزن (كغم)</label><input style={inp} type="number" placeholder="75" value={labData.w} onChange={e=>setLabData(p=>({...p,w:e.target.value}))}/></div>
              <div><label style={lbl}>العمر</label><input style={inp} type="number" placeholder="25" value={labAge} onChange={e=>setLabAge(e.target.value)}/></div>
            </div>
            <h4 style={h4a}>📐 قياسات الجسم (سم)</h4>
            <div style={g4}>
              {[{l:'الصدر',k:'chest'},{l:'الخصر',k:'waist'},{l:'الأرداف',k:'hips'},{l:'الفخذ ي',k:'thighR'},{l:'الفخذ ش',k:'thighL'},{l:'الذراع ي',k:'armR'},{l:'الذراع ش',k:'armL'}].map(({l,k})=>(
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
            {labMid&&(()=>{const m=members.find(x=>String(x.id)===labMid);if(!m?.history?.length)return null;return(
              <div style={{marginTop:'20px'}}><h4 style={h4n}>📜 السجل التاريخي</h4>
                <Tbl heads={['التاريخ','الوزن','الخصر','الدهون','BMI']} rows={[...m.history].reverse().map(h=>[h.date,h.w,h.waist,h.fat||'-',h.bmi||'-'])}/>
              </div>);})()}
          </div>
        </div>

        {/* === PROGRAM === */}
        <div style={sec('prog')} className="section-animate">
          <div style={card()}>
            <h3 style={h3s}>🍎 خطة التغذية والتدريب</h3>
            <select style={inp} value={progMid} onChange={e=>loadProg(e.target.value)}><option value="">-- اختر مشترك --</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <button style={btnA()} onClick={genProg}>✨ توليد الخطة الذكية AI</button>
            <div style={{...g3,marginTop:'18px'}}>
              <div><label style={{...lbl,color:'#00ff88',fontSize:'13px'}}>🥗 خطة التغذية</label><textarea style={{...inp,height:'300px',resize:'vertical' as const}} value={diet} onChange={e=>setDiet(e.target.value)}/></div>
              <div><label style={{...lbl,color:'#00e5ff',fontSize:'13px'}}>⚡ خطة EMS</label><textarea style={{...inp,height:'300px',resize:'vertical' as const}} value={train} onChange={e=>setTrain(e.target.value)}/></div>
            </div>
            <button style={btnN()} onClick={saveProg}>💾 حفظ الخطة</button>
          </div>
        </div>

        {/* === BOOKING === */}
        <div style={sec('book')} className="section-animate">
          <div style={card()}>
            <h3 style={h3s}>📅 حجز جلسة EMS</h3>
            <div style={g3}>
              <div>
                <label style={lbl}>المشترك</label>
                <select style={inp} value={bookMid} onChange={e=>setBookMid(e.target.value)}><option value="">-- اختر مشترك --</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
                {bookMember&&<div style={{marginTop:'8px',padding:'8px 12px',background:'rgba(204,255,0,0.08)',borderRadius:'8px',border:'1px solid rgba(204,255,0,0.2)'}}><span style={{color:'#777',fontSize:'12px',fontFamily:ff}}>الجلسات: </span><span style={{color:'#ccff00',fontWeight:900,fontFamily:fo}}>{bookMember.rem_sess}</span></div>}
              </div>
              <div><label style={lbl}>وقت الحجز</label><input style={inp} type="datetime-local" value={bookDate} onChange={e=>setBookDate(e.target.value)}/></div>
              <div><label style={lbl}>البدلة</label><select style={inp} value={bookSuit} onChange={e=>setBookSuit(e.target.value)}><option value="">-- اختر --</option>{suits.filter(s=>s.status==='avail').map(s=><option key={s.id} value={s.id}>بدلة {s.id} [{s.size}]</option>)}</select></div>
            </div>
            <button style={btnN()} onClick={confirmBook}>⚡ تثبيت الموعد وخصم جلسة</button>
          </div>
          {bookings.length>0&&<div style={card()}><h3 style={h3s}>📋 سجل الحجوزات</h3><Tbl heads={['المشترك','الوقت','البدلة','المقاس']} rows={[...bookings].reverse().map(b=>[b.mName,b.time.replace('T',' '),`بدلة ${b.suitId}`,b.suitSize])}/></div>}
        </div>

        {/* === STAFF === */}
        <div style={sec('staff')} className="section-animate">
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

        {/* === FINANCE === */}
        <div style={sec('fin')} className="section-animate">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'18px'}} className="no-print">
            {[{l:'إجمالي الدخل',v:finInc,c:'#00ff88',ic:'📈'},{l:'إجمالي الصرف',v:finExp,c:'#ff3333',ic:'📉'},{l:'الربح الفعلي',v:finInc-finExp,c:'#ccff00',ic:'💰'}].map(s=>(
              <div key={s.l} style={{...card({textAlign:'center',border:`1px solid ${s.c}22`,marginBottom:0})}}>
                <div style={{fontSize:'24px'}}>{s.ic}</div>
                <div style={{color:'#555',fontSize:'11px',fontFamily:ff,margin:'4px 0'}}>{s.l}</div>
                <div style={{color:s.c,fontSize:'24px',fontWeight:900,fontFamily:fo}}>{s.v.toFixed(0)} ₪</div>
              </div>
            ))}
          </div>
          <div style={card()} className="no-print">
            <h3 style={h3s}>💸 تسجيل نفقة</h3>
            <div style={g3}>
              <div><label style={lbl}>البيان</label><input style={inp} type="text" placeholder="وصف النفقة" value={fDesc} onChange={e=>setFDesc(e.target.value)}/></div>
              <div><label style={lbl}>المبلغ (₪)</label><input style={inp} type="number" placeholder="0" value={fAmt} onChange={e=>setFAmt(e.target.value)}/></div>
              <button style={btnN({marginTop:8})} onClick={addExp}>تسجيل الصرف</button>
            </div>
          </div>
          <div style={card()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}} className="no-print">
              <h3 style={{...h3s,marginBottom:0}}>📊 سجل المعاملات</h3>
              <button onClick={()=>window.print()} style={{background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'8px 18px',borderRadius:'8px',fontWeight:900,cursor:'pointer',fontFamily:ff,fontSize:'12px'}}>🖨️ طباعة</button>
            </div>
            {finance.length===0?<p style={{color:'#333',textAlign:'center',fontFamily:ff,padding:'30px'}}>لا معاملات</p>
            :<Tbl heads={['التاريخ','البيان','المبلغ','النوع']} rows={[...finance].reverse().map(x=>[
              <span style={{color:'#444',fontSize:'11px',fontFamily:ff}}>{x.date}</span>,
              x.desc,
              <span style={{color:x.type==='in'?'#00ff88':'#ff3333',fontWeight:900,fontFamily:fo}}>{x.amt} ₪</span>,
              <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11px',background:x.type==='in'?'rgba(0,255,136,0.1)':'rgba(255,51,51,0.1)',color:x.type==='in'?'#00ff88':'#ff3333',fontFamily:ff,fontWeight:700}}>{x.type==='in'?'دخل':'صرف'}</span>
            ])}/>}
          </div>
        </div>

        {/* === OFFERS === */}
        <div style={sec('off')} className="section-animate">
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

        {/* === PORTFOLIO === */}
        <div style={sec('port')} className="section-animate">
          <div style={card()} className="no-print">
            <h3 style={h3s}>📂 الملف الشامل للمشترك</h3>
            <div style={{display:'flex',gap:'14px',alignItems:'flex-end',flexWrap:'wrap'}}>
              <div style={{flex:1}}><label style={lbl}>اختر المشترك</label><select style={inp} value={portMid} onChange={e=>setPortMid(e.target.value)}><option value="">-- اختر --</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              {portMember&&<button onClick={()=>window.print()} style={{background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',border:'none',padding:'12px 22px',borderRadius:'10px',fontWeight:900,cursor:'pointer',fontFamily:ff,whiteSpace:'nowrap',boxShadow:'0 4px 14px rgba(204,255,0,0.3)'}}>🖨️ طباعة الملف</button>}
            </div>
          </div>
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
                  <p style={{margin:'5px 0',fontFamily:ff}}><b>الجلسات:</b> <span style={{color:'#00e5ff',fontWeight:900,fontSize:'16px'}}>{portMember.rem_sess}</span></p>
                  <p style={{margin:'5px 0',fontFamily:ff}}><b>الدين:</b> <span style={{color:'#ff3333',fontWeight:900,fontSize:'16px'}}>{portMember.debt} ₪</span></p>
                  <p style={{margin:'5px 0',fontFamily:ff}}><b>المدفوع:</b> {portMember.paid} ₪</p>
                  <p style={{margin:'5px 0',fontFamily:ff}}><b>الباقة:</b> {portMember.total} ₪</p>
                </div>
              </div>
              <hr style={{border:'1px solid #eee',margin:'18px 0'}}/>
              <h3 style={{borderRight:'5px solid #ccff00',paddingRight:'10px',fontFamily:ff}}>📏 القياسات</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'18px'}}>
                {[{l:'الوزن',v:portMember.lab.w?portMember.lab.w+' كغم':'-'},{l:'الطول',v:portMember.lab.h?portMember.lab.h+' سم':'-'},{l:'الخصر',v:portMember.lab.waist?portMember.lab.waist+' سم':'-'},{l:'الصدر',v:portMember.lab.chest?portMember.lab.chest+' سم':'-'},{l:'الأرداف',v:portMember.lab.hips?portMember.lab.hips+' سم':'-'},{l:'الدهون',v:portMember.lab.fat||'-'},{l:'BMI',v:portMember.lab.bmi||'-'},{l:'العضل',v:portMember.lab.mus||'-'}].map((it,i)=>(
                  <div key={i} style={{background:'#f5f5f5',padding:'8px',borderRadius:'8px',textAlign:'center'}}><div style={{fontSize:'10px',color:'#888'}}>{it.l}</div><div style={{fontWeight:'bold',marginTop:'3px'}}>{it.v}</div></div>
                ))}
              </div>
              {portMember.history?.length>0&&<><hr style={{border:'1px solid #eee',margin:'18px 0'}}/><h3 style={{borderRight:'5px solid #ccff00',paddingRight:'10px',fontFamily:ff}}>📜 سجل التطور</h3><table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}><thead><tr style={{background:'#f0f0f0'}}>{['التاريخ','الوزن','الخصر','الدهون','BMI'].map(h=><th key={h} style={{padding:'7px',textAlign:'right',border:'1px solid #ddd',fontFamily:ff}}>{h}</th>)}</tr></thead><tbody>{[...portMember.history].reverse().map((h,i)=><tr key={i}>{[h.date,h.w,h.waist,h.fat,h.bmi].map((v,j)=><td key={j} style={{padding:'7px',border:'1px solid #eee',fontFamily:ff}}>{v}</td>)}</tr>)}</tbody></table></>}
              <hr style={{border:'1px solid #eee',margin:'18px 0'}}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'22px'}}>
                <div><h4 style={{fontFamily:ff,borderRight:'3px solid #00ff88',paddingRight:'8px'}}>🥗 التغذية</h4><p style={{whiteSpace:'pre-wrap',background:'#f8f8f8',padding:'12px',borderRadius:'8px',fontSize:'12px',fontFamily:ff}}>{portMember.diet||'لم يتم تحديد خطة'}</p></div>
                <div><h4 style={{fontFamily:ff,borderRight:'3px solid #00e5ff',paddingRight:'8px'}}>⚡ خطة EMS</h4><p style={{whiteSpace:'pre-wrap',background:'#f8f8f8',padding:'12px',borderRadius:'8px',fontSize:'12px',fontFamily:ff}}>{portMember.train||'لم يتم تحديد خطة'}</p></div>
              </div>
              <div style={{marginTop:'20px',borderTop:'2px solid #ccff00',paddingTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:'10px',color:'#aaa',fontFamily:fo}}>SMART SPORT LAND © 2025</div>
                <div style={{fontSize:'10px',color:'#aaa',fontFamily:ff}}>نابلس · فلسطين</div>
              </div>
            </div>
          )}
        </div>

      </div>{/* end main */}

      {/* TOAST */}
      {toast&&<div style={{position:'fixed',bottom:'28px',left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#ccff00,#aae000)',color:'#000',padding:'13px 26px',borderRadius:'28px',fontWeight:900,zIndex:9999,boxShadow:'0 6px 28px rgba(204,255,0,0.5)',fontSize:'14px',fontFamily:ff,whiteSpace:'nowrap',direction:'rtl'}}>{toast}</div>}
    </div>
  );
}
