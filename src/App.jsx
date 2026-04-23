import { useState } from “react”;

const SHIFTS = [
{ id: “morning”,   label: “Morning”,   time: “6:00 AM – 2:00 PM”,   hours: 8, color: “#f59e0b”, light: “#fffbeb” },
{ id: “afternoon”, label: “Afternoon”, time: “2:00 PM – 6:00 PM”,   hours: 4, color: “#3b82f6”, light: “#eff6ff” },
{ id: “evening”,   label: “Evening”,   time: “6:00 PM – 12:00 AM”,  hours: 6, color: “#8b5cf6”, light: “#f5f3ff” },
{ id: “night”,     label: “Night”,     time: “12:00 AM – 8:00 AM”,  hours: 8, color: “#1e3a5f”, light: “#f0f4ff” },
];

const STAFF = [
{ id: 1, name: “Dr. Ahmad Al-Rashidi”,  badge: “39318”, dept: “UCC” },
{ id: 2, name: “Dr. Sara Al-Mutairi”,   badge: “40221”, dept: “ER”  },
{ id: 3, name: “Dr. Khalid Mansoor”,    badge: “38814”, dept: “ICU” },
{ id: 4, name: “Dr. Fatima Al-Zahrani”, badge: “41005”, dept: “UCC” },
{ id: 5, name: “Dr. Omar Al-Farsi”,     badge: “39901”, dept: “ER”  },
{ id: 6, name: “Dr. Layla Hassan”,      badge: “40678”, dept: “Peds”},
{ id: 7, name: “Dr. Yousef Al-Dosari”,  badge: “38422”, dept: “ICU” },
{ id: 8, name: “Dr. Nora Al-Otaibi”,    badge: “41234”, dept: “UCC” },
];

const MAX_PER_SLOT = 3;
const YEAR = 2025, MONTH = 4;
const DAYS_IN_MONTH = 31;
const FIRST_DOW = 3;

const INITIAL_BOOKINGS = {
“2025-05-01”: { morning: [“39318”,“40221”], afternoon: [“38814”], evening: [“41005”,“40678”,“38422”], night: [“39901”,“41234”,“38814”] },
“2025-05-03”: { morning: [“40221”,“38814”,“41005”], afternoon: [“39318”,“40678”], evening: [], night: [“39901”] },
“2025-05-07”: { morning: [“39318”], afternoon: [“40221”,“38814”,“41005”], evening: [“39901”,“40678”,“38422”], night: [“41234”,“38814”,“39318”] },
“2025-05-10”: { morning: [“40221”,“38814”,“41005”], afternoon: [“39318”,“40678”,“38422”], evening: [“39901”,“41234”,“38814”], night: [“39318”,“40221”,“38814”] },
“2025-05-14”: { morning: [“39318”,“40221”,“38814”], afternoon: [“41005”,“40678”,“38422”], evening: [“39901”], night: [“41234”,“38814”] },
“2025-05-17”: { morning: [], afternoon: [“39318”], evening: [“40221”,“38814”,“41005”], night: [“40678”,“38422”,“39901”] },
“2025-05-20”: { morning: [“41234”,“38814”,“39318”], afternoon: [“40221”,“41005”,“40678”], evening: [“38422”,“39901”,“41234”], night: [“38814”,“39318”,“40221”] },
“2025-05-25”: { morning: [“38814”,“41005”], afternoon: [“40678”], evening: [“38422”,“39901”,“41234”], night: [“38814”] },
};

function dk(day) {
return `${YEAR}-05-${String(day).padStart(2,"0")}`;
}

export default function App() {
const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
const [staffId, setStaffId] = useState(””);
const [selectedDate, setSelectedDate] = useState(null);
const [selectedShift, setSelectedShift] = useState(null);
const [myBookings, setMyBookings] = useState([]);
const [submitted, setSubmitted] = useState(false);

const staff = STAFF.find(s => s.id === parseInt(staffId));

function slotTaken(day, shiftId) {
return (bookings[dk(day)]?.[shiftId] || []).length;
}
function slotFull(day, shiftId) {
return slotTaken(day, shiftId) >= MAX_PER_SLOT;
}
function dayFull(day) {
return SHIFTS.every(s => slotFull(day, s.id));
}

const vacantDays = Array.from({length: DAYS_IN_MONTH}, (_,i)=>i+1).filter(d=>!dayFull(d)).length;

function handleSelectDate(day) {
if (dayFull(day) || !staffId) return;
setSelectedDate(day);
setSelectedShift(null);
}

function handleSelectShift(shiftId) {
if (slotFull(selectedDate, shiftId)) return;
setSelectedShift(shiftId);
}

function handleSubmit() {
if (!staff || !selectedDate || !selectedShift) return;
const key = dk(selectedDate);
const prev = bookings[key]?.[selectedShift] || [];
setBookings(b => ({ …b, [key]: { …(b[key]||{}), [selectedShift]: […prev, staff.badge] } }));
setMyBookings(mb => […mb, { date: selectedDate, shift: selectedShift }]);
setSubmitted(true);
}

function resetForm() {
setSelectedDate(null);
setSelectedShift(null);
setSubmitted(false);
}

const shiftInfo = selectedDate
? SHIFTS.map(s => ({ …s, taken: slotTaken(selectedDate, s.id), left: MAX_PER_SLOT - slotTaken(selectedDate, s.id), full: slotFull(selectedDate, s.id) }))
: [];

const selectedShiftObj = SHIFTS.find(s => s.id === selectedShift);
const canSubmit = staff && selectedDate && selectedShift;
const DLABELS = [“Sun”,“Mon”,“Tue”,“Wed”,“Thu”,“Fri”,“Sat”];

if (submitted) {
return (
<div style={P.page}>
<div style={P.header}>
<span style={P.htitle}>overtime-request</span>
<span style={P.hbadge}>May 2025</span>
</div>
<div style={{…P.card, textAlign:“center”, padding:“40px 20px”}}>
<div style={{fontSize:52, marginBottom:12}}>✅</div>
<div style={{fontWeight:800, fontSize:17, color:”#1e3a5f”, marginBottom:6}}>Shift Booked!</div>
<div style={{fontSize:13, color:”#475569”, lineHeight:1.8, marginBottom:20}}>
<b>{staff?.name}</b><br/>
📅 May {selectedDate}, 2025 — <b>{selectedShiftObj?.label}</b><br/>
🕐 {selectedShiftObj?.time} · <b>{selectedShiftObj?.hours} hrs</b>
</div>
<div style={{background:”#f0fdf4”, border:“1px solid #bbf7d0”, borderRadius:10, padding:“10px 14px”, fontSize:13, color:”#15803d”, marginBottom:20}}>
✉️ Auto-notification sent to admin
</div>
{myBookings.length > 0 && (
<div style={{background:”#f8fafc”, border:“1px solid #e2e8f0”, borderRadius:10, padding:“12px 14px”, marginBottom:20, textAlign:“left”}}>
<div style={{fontSize:11, fontWeight:800, color:”#94a3b8”, letterSpacing:1, marginBottom:8}}>YOUR BOOKINGS THIS MONTH</div>
{myBookings.map((b,i) => {
const sh = SHIFTS.find(s=>s.id===b.shift);
return (
<div key={i} style={{fontSize:13, color:”#334155”, padding:“5px 0”, borderBottom:i<myBookings.length-1?“1px solid #f1f5f9”:“none”, display:“flex”, alignItems:“center”, gap:8}}>
<span style={{width:10,height:10,borderRadius:3,background:sh?.color,display:“inline-block”,flexShrink:0}}/>
May {b.date} · {sh?.label} · {sh?.hours} hrs
</div>
);
})}
</div>
)}
<button style={{…P.submitBtn, opacity:1}} onClick={resetForm}>+ Book Another Shift</button>
</div>
</div>
);
}

return (
<div style={P.page}>
<div style={P.header}>
<span style={P.htitle}>overtime-request</span>
<span style={P.hbadge}>May 2025</span>
</div>

```
  <div style={P.notice}>⚠️ <b>Max {MAX_PER_SLOT} staff/slot · 1 shift per day</b> · real-time shared calendar</div>

  <div style={P.card}>
    <div style={P.sh}><span style={P.si}>👤</span><span style={P.sl}>STEP 1 · SELECT STAFF</span></div>
    <select style={P.sel} value={staffId} onChange={e => { setStaffId(e.target.value); setSelectedDate(null); setSelectedShift(null); }}>
      <option value="">— Choose Staff Member —</option>
      {STAFF.map(s => <option key={s.id} value={s.id}>{s.name} · {s.badge} · {s.dept}</option>)}
    </select>
    {staff && (
      <div style={P.staffRow}>
        <div style={P.avatar}>{staff.name.split(" ")[1]?.[0]}{staff.name.split(" ")[2]?.[0]}</div>
        <div>
          <div style={{fontWeight:700, fontSize:14, color:"#1e3a5f"}}>{staff.name}</div>
          <div style={{fontSize:12, color:"#64748b"}}>Badge {staff.badge} · {staff.dept}</div>
        </div>
      </div>
    )}
  </div>

  <div style={{...P.card, opacity:staffId?1:0.4, pointerEvents:staffId?"auto":"none"}}>
    <div style={P.sh}><span style={P.si}>📅</span><span style={P.sl}>STEP 2 · SELECT DATE (MAY 1–31)</span></div>
    <div style={P.vacBar}>
      <span style={{fontSize:13, color:"#334155", fontWeight:600}}>{vacantDays} days with open slots</span>
      <span style={{fontSize:12, color:"#94a3b8"}}>🔒 = full &amp; locked</span>
    </div>
    <div style={P.grid}>
      {DLABELS.map(d => <div key={d} style={P.dlabel}>{d}</div>)}
      {Array.from({length: FIRST_DOW}).map((_,i) => <div key={`b${i}`}/>)}
      {Array.from({length: DAYS_IN_MONTH}, (_,i) => i+1).map(day => {
        const full = dayFull(day);
        const sel = selectedDate === day;
        const mine = myBookings.some(b => b.date === day);
        return (
          <button key={day} onClick={() => handleSelectDate(day)} disabled={full}
            style={{...P.dayBtn, ...(full?P.dayFull:{}), ...(sel?P.daySel:{}), ...(mine&&!sel?P.dayMine:{})}}>
            {full
              ? <><span style={{fontSize:9,display:"block",color:"#94a3b8"}}>{day}</span><span style={{fontSize:11}}>🔒</span></>
              : <span style={{fontSize:15, fontWeight:sel?800:500}}>{day}</span>}
          </button>
        );
      })}
    </div>
    <div style={P.legend}>
      <span style={P.li}><span style={{...P.dot, background:"#1e3a5f"}}/>Selected</span>
      <span style={P.li}><span style={{...P.dot, background:"#f1f5f9", border:"1px dashed #cbd5e1"}}/>🔒 Full</span>
      <span style={P.li}><span style={{...P.dot, background:"#dbeafe", border:"1px solid #93c5fd"}}/>My booking</span>
    </div>
  </div>

  <div style={{...P.card, opacity:selectedDate?1:0.4, pointerEvents:selectedDate?"auto":"none"}}>
    <div style={P.sh}><span style={P.si}>🕐</span><span style={P.sl}>STEP 3 · SELECT SHIFT{selectedDate?` — MAY ${selectedDate}`:""}</span></div>
    {!selectedDate
      ? <div style={P.hint}>👆 Select a date first</div>
      : <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {shiftInfo.map(sh => (
            <button key={sh.id} disabled={sh.full} onClick={() => handleSelectShift(sh.id)}
              style={{...P.shiftBtn, ...(sh.full?P.shiftFull:{}), ...(selectedShift===sh.id?{border:`2px solid ${sh.color}`,background:sh.light}:{}), borderLeft:`4px solid ${sh.full?"#cbd5e1":sh.color}`}}>
              <div style={{flex:1, textAlign:"left"}}>
                <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:3}}>
                  <span style={{fontSize:14, fontWeight:700, color:sh.full?"#94a3b8":"#1e293b"}}>{sh.label}</span>
                  {sh.full && <span style={P.badge}>🔒 FULL</span>}
                  {!sh.full && selectedShift===sh.id && <span style={{...P.badge, background:"#dcfce7", color:"#15803d", border:"1px solid #bbf7d0"}}>✓ SELECTED</span>}
                </div>
                <div style={{fontSize:12, color:"#64748b"}}>{sh.time} · {sh.hours} hrs</div>
              </div>
              <div style={{textAlign:"right", marginRight:8}}>
                <div style={{fontSize:22, fontWeight:800, color:sh.full?"#cbd5e1":sh.color, lineHeight:1}}>{sh.left}</div>
                <div style={{fontSize:10, color:"#94a3b8"}}>slots left</div>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:4}}>
                {Array.from({length:MAX_PER_SLOT}).map((_,i) => (
                  <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<sh.taken?sh.color:"#e2e8f0",opacity:sh.full?0.4:1}}/>
                ))}
              </div>
            </button>
          ))}
        </div>
    }
  </div>

  <div style={{...P.card, opacity:canSubmit?1:0.4, background:"#f0fdf4", border:"1px solid #bbf7d0"}}>
    <div style={P.sh}><span style={P.si}>✅</span><span style={{...P.sl, color:"#15803d"}}>REQUEST PREVIEW</span></div>
    {canSubmit
      ? <div style={{fontSize:14, color:"#1e293b", lineHeight:2.1}}>
          <b>{staff?.name}</b> · {staff?.badge} · {staff?.dept}<br/>
          📅 <b>May {selectedDate}, 2025</b><br/>
          🕐 <b>{selectedShiftObj?.label}</b> — {selectedShiftObj?.time}<br/>
          ⏱ <b>{selectedShiftObj?.hours} hrs</b>
        </div>
      : <div style={P.hint}>Complete steps above to see preview</div>
    }
  </div>

  <button style={{...P.submitBtn, opacity:canSubmit?1:0.35}} disabled={!canSubmit} onClick={handleSubmit}>
    SUBMIT OVERTIME REQUEST
  </button>
  <div style={{textAlign:"center", fontSize:11, color:"#94a3b8", padding:"8px 0 32px"}}>
    ⓘ Once submitted, shifts are permanently locked for all staff
  </div>
</div>
```

);
}

const P = {
page:      { fontFamily:”‘Courier New’, monospace”, background:”#f1f5f9”, minHeight:“100vh”, maxWidth:430, margin:“0 auto” },
header:    { background:”#fff”, padding:“14px 20px”, display:“flex”, alignItems:“center”, justifyContent:“space-between”, borderBottom:“1px solid #e2e8f0”, position:“sticky”, top:0, zIndex:10 },
htitle:    { fontSize:15, fontWeight:700, color:”#1e293b” },
hbadge:    { fontSize:11, color:”#94a3b8”, background:”#f1f5f9”, borderRadius:20, padding:“2px 10px” },
notice:    { background:”#fffbeb”, borderBottom:“1px solid #fcd34d”, padding:“10px 20px”, fontSize:12, color:”#92400e”, textAlign:“center” },
card:      { background:”#fff”, borderRadius:14, margin:“14px 14px 0”, padding:“16px”, boxShadow:“0 1px 4px rgba(0,0,0,0.07)” },
sh:        { display:“flex”, alignItems:“center”, gap:8, marginBottom:14 },
si:        { fontSize:18 },
sl:        { fontSize:11, fontWeight:800, letterSpacing:1.2, color:”#64748b” },
sel:       { width:“100%”, padding:“10px 12px”, borderRadius:8, border:“1px solid #e2e8f0”, fontSize:13, color:”#334155”, background:”#f8fafc”, outline:“none” },
staffRow:  { display:“flex”, alignItems:“center”, gap:12, marginTop:12, padding:“10px 12px”, background:”#f0f4ff”, borderRadius:10, border:“1px solid #c7d7f4” },
avatar:    { width:38, height:38, borderRadius:“50%”, background:”#1e3a5f”, color:”#fff”, display:“flex”, alignItems:“center”, justifyContent:“center”, fontSize:13, fontWeight:700, flexShrink:0 },
vacBar:    { display:“flex”, justifyContent:“space-between”, alignItems:“center”, marginBottom:12, padding:“8px 10px”, background:”#f8fafc”, borderRadius:8, border:“1px solid #e2e8f0” },
grid:      { display:“grid”, gridTemplateColumns:“repeat(7,1fr)”, gap:5 },
dlabel:    { textAlign:“center”, fontSize:10, fontWeight:700, color:”#94a3b8”, padding:“4px 0” },
dayBtn:    { aspectRatio:“1”, borderRadius:8, border:“1px solid #e2e8f0”, background:”#f8fafc”, cursor:“pointer”, display:“flex”, flexDirection:“column”, alignItems:“center”, justifyContent:“center”, padding:0 },
dayFull:   { background:”#f1f5f9”, cursor:“not-allowed”, border:“1px dashed #cbd5e1” },
daySel:    { background:”#1e3a5f”, color:”#fff”, border:“2px solid #1e3a5f” },
dayMine:   { background:”#dbeafe”, border:“1px solid #93c5fd”, color:”#1d4ed8” },
legend:    { display:“flex”, gap:14, marginTop:12, fontSize:11, color:”#64748b”, flexWrap:“wrap” },
li:        { display:“flex”, alignItems:“center”, gap:5 },
dot:       { width:10, height:10, borderRadius:3, display:“inline-block”, flexShrink:0 },
hint:      { textAlign:“center”, fontSize:13, color:”#94a3b8”, padding:“16px 0”, fontStyle:“italic” },
shiftBtn:  { width:“100%”, padding:“12px 14px”, borderRadius:10, border:“1px solid #e2e8f0”, background:”#f8fafc”, cursor:“pointer”, display:“flex”, alignItems:“center”, gap:8 },
shiftFull: { opacity:0.55, cursor:“not-allowed” },
badge:     { fontSize:10, fontWeight:700, background:”#fee2e2”, color:”#dc2626”, border:“1px solid #fca5a5”, borderRadius:4, padding:“1px 6px” },
submitBtn: { display:“block”, width:“calc(100% - 28px)”, margin:“14px 14px 0”, padding:“16px”, background:”#1e3a5f”, color:”#fff”, border:“none”, borderRadius:12, fontSize:13, fontWeight:800, letterSpacing:1.5, cursor:“pointer” },
};
