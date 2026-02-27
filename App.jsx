import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const sb = createClient(
  "https://jqgakwqprnqmvqtyrkbu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZ2Frd3Fwcm5xbXZxdHlya2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDIxNjQsImV4cCI6MjA4Nzc3ODE2NH0.H0Z1UFGjy1-OEbV0WVmfcCk6TBgTak9ti20a9_JdoFE"
);

const db = {
  getProducts:   async () => { const { data, error } = await sb.from("products").select("*").order("name"); if (error) throw error; return data || []; },
  getSales:      async () => { const { data, error } = await sb.from("sales").select("*").order("date", { ascending: false }); if (error) throw error; return data || []; },
  addProduct:    async (p) => { const { error } = await sb.from("products").insert(p); if (error) throw error; },
  updateProduct: async (id, p) => { const { error } = await sb.from("products").update(p).eq("id", id); if (error) throw error; },
  deleteProduct: async (id) => { const { error } = await sb.from("products").delete().eq("id", id); if (error) throw error; },
  addSale:       async (s) => { const { error } = await sb.from("sales").insert(s); if (error) throw error; },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED = [
  { id:"p1", name:"Classic Rubber Slipper",  sizes:"6,7,8,9,10,11",  color:"Black", stock:120, retail_price:350, bulk_price:280, bulk_min_qty:12 },
  { id:"p2", name:"Beach Flip Flop",         sizes:"6,7,8,9,10",     color:"Blue",  stock:85,  retail_price:290, bulk_price:230, bulk_min_qty:12 },
  { id:"p3", name:"Ladies Flat Slipper",     sizes:"4,5,6,7,8",      color:"Pink",  stock:60,  retail_price:380, bulk_price:310, bulk_min_qty:12 },
  { id:"p4", name:"Kids Rubber Slipper",     sizes:"1,2,3,4,5",      color:"Red",   stock:200, retail_price:220, bulk_price:175, bulk_min_qty:24 },
  { id:"p5", name:"Heavy Duty Work Slipper", sizes:"7,8,9,10,11,12", color:"Brown", stock:45,  retail_price:480, bulk_price:390, bulk_min_qty:6  },
];

const USERS = [
  { username:"admin", password:"gamage2024", role:"Admin" },
  { username:"staff", password:"staff123",   role:"Staff" },
];

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#0f1117", card:"#181c27", border:"#252a38",
  accent:"#f5a623", accent2:"#e8431a",
  text:"#eef1f8", muted:"#6b7491",
  green:"#22c97a", red:"#f04f4f", blue:"#4f8ef0",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:${T.bg};}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
  input,select{font-family:'DM Sans',sans-serif;outline:none;}
  .syne{font-family:'Syne',sans-serif;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
  .fade{animation:fadeIn 0.3s ease forwards;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin 0.8s linear infinite;display:inline-block;}
`;

// ─── UI ───────────────────────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:24, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant="primary", small, disabled, style }) => {
  const v = { primary:{background:T.accent,color:"#000"}, danger:{background:T.red,color:"#fff"}, ghost:{background:"transparent",color:T.muted,border:`1px solid ${T.border}`}, success:{background:T.green,color:"#000"} };
  return <button onClick={onClick} disabled={disabled} style={{ border:"none", borderRadius:8, cursor:disabled?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500, padding:small?"7px 14px":"11px 20px", fontSize:small?13:14, opacity:disabled?0.5:1, ...v[variant], ...style }}>{children}</button>;
};

const Inp = ({ label, value, onChange, type="text", placeholder, min }) => (
  <div style={{ marginBottom:14 }}>
    {label && <div style={{ fontSize:12, color:T.muted, marginBottom:5, fontWeight:500, letterSpacing:"0.04em" }}>{label}</div>}
    <input type={type} value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min}
      style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, padding:"10px 13px", fontSize:14 }}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} />
  </div>
);

const Badge = ({ children, color }) => (
  <span style={{ background:color+"22", color, borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:500 }}>{children}</span>
);

const Spin = () => <span className="spin" style={{ fontSize:20 }}>⟳</span>;

const Toast = ({ toast }) => toast ? (
  <div style={{ position:"fixed", bottom:28, right:28, background:toast.type==="error"?T.red:T.green, color:"#000", borderRadius:10, padding:"14px 20px", fontWeight:500, fontSize:14, zIndex:999, boxShadow:"0 8px 32px #0006" }}>
    {toast.type==="error"?"⚠️ ":"✓ "}{toast.msg}
  </div>
) : null;

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#000a", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fade" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:28, width:490, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="syne" style={{ fontWeight:700, fontSize:18 }}>{title}</div>
          <div onClick={onClose} style={{ cursor:"pointer", color:T.muted, fontSize:22 }}>×</div>
        </div>
        {children}
      </div>
    </div>
  );
}

const Row = ({ label, value, highlight, large, color }) => (
  <div style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", fontSize:large?16:13 }}>
    <span style={{ color:T.muted }}>{label}</span>
    <span style={{ fontWeight:highlight?700:400, color:color||(highlight?T.text:T.muted) }}>{value}</span>
  </div>
);

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
  const go=()=>{ const f=USERS.find(x=>x.username===u&&x.password===p); f?onLogin(f):setErr("Invalid credentials."); };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:`radial-gradient(ellipse at 60% 40%,#1a1f30,${T.bg} 70%)` }}>
      <style>{css}</style>
      <div className="fade" style={{ width:380 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:64, height:64, borderRadius:18, background:`linear-gradient(135deg,${T.accent},${T.accent2})`, marginBottom:16, fontSize:28 }}>👡</div>
          <div className="syne" style={{ fontSize:26, fontWeight:800 }}>GAMAGE <span style={{ color:T.accent }}>FOOTWARES</span></div>
          <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>Sales & Inventory Management</div>
          <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:6, background:`${T.green}18`, border:`1px solid ${T.green}44`, borderRadius:20, padding:"4px 14px" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:T.green }} />
            <span style={{ fontSize:11, color:T.green }}>Supabase Connected</span>
          </div>
        </div>
        <Card>
          <div className="syne" style={{ fontWeight:700, fontSize:18, marginBottom:20 }}>Sign In</div>
          <Inp label="USERNAME" value={u} onChange={setU} placeholder="Enter username" />
          <Inp label="PASSWORD" value={p} onChange={setP} type="password" placeholder="Enter password" />
          {err && <div style={{ color:T.red, fontSize:13, marginBottom:12 }}>{err}</div>}
          <Btn onClick={go} style={{ width:"100%", marginTop:4 }}>Sign In →</Btn>
          <div style={{ marginTop:16, padding:12, background:T.bg, borderRadius:8, fontSize:12, color:T.muted }}>
            <b style={{ color:T.text }}>Admin:</b> admin / gamage2024 &nbsp;|&nbsp; <b style={{ color:T.text }}>Staff:</b> staff / staff123
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, user, onLogout }) {
  const links=[{id:"dashboard",icon:"◈",label:"Dashboard"},{id:"inventory",icon:"▦",label:"Inventory"},{id:"sales",icon:"⊕",label:"New Sale"},{id:"reports",icon:"◉",label:"Reports"}];
  return (
    <div style={{ position:"fixed", left:0, top:0, bottom:0, width:220, background:T.card, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", padding:"24px 14px" }}>
      <div style={{ marginBottom:32, paddingLeft:8 }}>
        <div className="syne" style={{ fontSize:15, fontWeight:800, letterSpacing:"0.05em", color:T.accent }}>GAMAGE</div>
        <div className="syne" style={{ fontSize:11, color:T.muted, letterSpacing:"0.1em" }}>FOOTWARES</div>
        <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:T.green }} />
          <span style={{ fontSize:10, color:T.green }}>Supabase Live DB</span>
        </div>
      </div>
      <div style={{ flex:1 }}>
        {links.map(l=>(
          <div key={l.id} onClick={()=>setTab(l.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:9, marginBottom:4, cursor:"pointer", background:tab===l.id?`${T.accent}18`:"transparent", color:tab===l.id?T.accent:T.muted, fontWeight:tab===l.id?500:400, fontSize:14, borderLeft:tab===l.id?`3px solid ${T.accent}`:"3px solid transparent" }}>
            <span style={{ fontSize:16 }}>{l.icon}</span>{l.label}
          </div>
        ))}
      </div>
      <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:16 }}>
        <div style={{ padding:"10px 14px", marginBottom:8 }}>
          <div style={{ fontSize:13, fontWeight:500 }}>{user.username}</div>
          <Badge color={user.role==="Admin"?T.accent:T.blue}>{user.role}</Badge>
        </div>
        <div onClick={onLogout} style={{ padding:"10px 14px", borderRadius:9, cursor:"pointer", color:T.red, fontSize:14 }}>⊗ Sign Out</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]         = useState(null);
  const [tab,setTab]           = useState("dashboard");
  const [products,setProducts] = useState([]);
  const [sales,setSales]       = useState([]);
  const [loading,setLoading]   = useState(true);
  const [error,setError]       = useState(null);
  const [toast,setToast]       = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let prods = await db.getProducts();
      if (prods.length === 0) {
        for (const p of SEED) { try { await db.addProduct(p); } catch {} }
        prods = await db.getProducts();
      }
      const s = await db.getSales();
      setProducts(prods); setSales(s);
    } catch(e) { setError(e.message||"Cannot connect to Supabase."); }
    setLoading(false);
  }, []);

  useEffect(()=>{ if(user) load(); },[user,load]);

  const reloadP = async()=>{ const p=await db.getProducts(); setProducts(p); };
  const reloadS = async()=>{ const s=await db.getSales();    setSales(s);   };
  const reload  = async()=>{ await reloadP(); await reloadS(); };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div style={{ minHeight:"100vh", background:T.bg }}>
      <style>{css}</style>
      <Sidebar tab={tab} setTab={setTab} user={user} onLogout={()=>{setUser(null);setProducts([]);setSales([]);}} />
      <div style={{ marginLeft:220, padding:"32px 36px", minHeight:"100vh" }}>
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", gap:16 }}>
            <div style={{ fontSize:36 }}><Spin /></div>
            <div style={{ color:T.muted }}>Loading from Supabase…</div>
          </div>
        ) : error ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", gap:16, textAlign:"center" }}>
            <div style={{ fontSize:40 }}>⚠️</div>
            <div className="syne" style={{ fontSize:20, color:T.red }}>Connection Error</div>
            <div style={{ color:T.muted, fontSize:14, maxWidth:460 }}>{error}</div>
            <Btn onClick={load}>🔄 Retry</Btn>
          </div>
        ) : (
          <>
            {tab==="dashboard" && <Dashboard products={products} sales={sales} />}
            {tab==="inventory" && <Inventory products={products} user={user} reloadP={reloadP} showToast={showToast} />}
            {tab==="sales"     && <SalesPage products={products} sales={sales} user={user} reload={reload} showToast={showToast} />}
            {tab==="reports"   && <Reports products={products} sales={sales} />}
          </>
        )}
      </div>
      <Toast toast={toast} />
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ products, sales }) {
  const today=new Date().toDateString();
  const todayRev  = sales.filter(s=>new Date(s.date).toDateString()===today).reduce((a,s)=>a+s.total,0);
  const totalRev  = sales.reduce((a,s)=>a+s.total,0);
  const totalStock= products.reduce((a,p)=>a+p.stock,0);
  const totalQty  = sales.reduce((a,s)=>a+s.qty,0);
  const lowStock  = products.filter(p=>p.stock<20);
  const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); const ds=d.toDateString(); return { label:d.toLocaleDateString("en",{weekday:"short"}), rev:sales.filter(s=>new Date(s.date).toDateString()===ds).reduce((a,s)=>a+s.total,0) }; });
  const maxRev=Math.max(...last7.map(d=>d.rev),1);
  return (
    <div className="fade">
      <div className="syne" style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>Dashboard</div>
      <div style={{ color:T.muted, fontSize:14, marginBottom:28 }}>{new Date().toLocaleDateString("en-LK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {[{label:"Total Revenue",value:`Rs. ${totalRev.toLocaleString()}`,icon:"💰",color:T.accent},{label:"Today's Revenue",value:`Rs. ${todayRev.toLocaleString()}`,icon:"📈",color:T.green},{label:"Total Stock",value:totalStock,icon:"📦",color:T.blue},{label:"Items Sold",value:totalQty,icon:"🛍️",color:T.accent2}]
        .map(s=>(
          <Card key={s.label} style={{ padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ fontSize:28 }}>{s.icon}</div>
              <div><div className="syne" style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div><div style={{ fontSize:12, color:T.muted }}>{s.label}</div></div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <Card>
          <div className="syne" style={{ fontWeight:700, marginBottom:20 }}>Revenue – Last 7 Days</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:140 }}>
            {last7.map(d=>(
              <div key={d.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ fontSize:10, color:T.muted }}>{d.rev>0?`Rs.${(d.rev/1000).toFixed(1)}k`:""}</div>
                <div style={{ width:"100%", background:d.rev>0?`linear-gradient(to top,${T.accent},${T.accent2})`:T.border, borderRadius:"5px 5px 0 0", height:`${(d.rev/maxRev)*100}px`, minHeight:4 }} />
                <div style={{ fontSize:11, color:T.muted }}>{d.label}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="syne" style={{ fontWeight:700, marginBottom:16 }}>⚠️ Low Stock <Badge color={T.red}>{lowStock.length}</Badge></div>
          {lowStock.length===0?<div style={{ color:T.green,fontSize:14 }}>✓ All products well-stocked!</div>
          :lowStock.map(p=>(
            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
              <div><div style={{ fontSize:13, fontWeight:500 }}>{p.name}</div><div style={{ fontSize:11, color:T.muted }}>{p.color}</div></div>
              <Badge color={p.stock<10?T.red:T.accent}>{p.stock} pcs</Badge>
            </div>
          ))}
        </Card>
      </div>
      <Card style={{ marginTop:20 }}>
        <div className="syne" style={{ fontWeight:700, marginBottom:16 }}>Recent Sales</div>
        {sales.length===0?<div style={{ color:T.muted,fontSize:14 }}>No sales yet.</div>
        :sales.slice(0,8).map(s=>(
          <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
            <div><div style={{ fontSize:13 }}>{s.product_name}</div><div style={{ fontSize:11, color:T.muted }}>{new Date(s.date).toLocaleString()} · {s.customer||"Walk-in"}</div></div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Badge color={s.type==="Bulk"?T.blue:T.muted}>{s.type} · {s.qty} pcs</Badge>
              <div style={{ fontWeight:600, color:T.green }}>Rs. {s.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
function Inventory({ products, user, reloadP, showToast }) {
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const [saving,setSaving]=useState(false);
  const isAdmin=user.role==="Admin";
  const F=(k,v)=>setForm(f=>({...f,[k]:v}));

  const save=async()=>{
    if(!form.name||saving) return; setSaving(true);
    const data={...form,stock:parseInt(form.stock)||0,retail_price:parseFloat(form.retail_price)||0,bulk_price:parseFloat(form.bulk_price)||0,bulk_min_qty:parseInt(form.bulk_min_qty)||1};
    try {
      if(modal.data) await db.updateProduct(modal.data.id,data);
      else await db.addProduct({...data,id:"p"+Date.now()});
      await reloadP(); setModal(null); showToast(modal.data?"Updated!":"Product added!");
    } catch(e){ showToast("Save failed: "+e.message,"error"); }
    setSaving(false);
  };

  const del=async(id)=>{
    if(!confirm("Delete this product?")) return;
    try{ await db.deleteProduct(id); await reloadP(); showToast("Deleted."); }
    catch(e){ showToast("Delete failed.","error"); }
  };

  const doRestock=async()=>{
    const q=parseInt(form.qty); if(!q||q<=0) return; setSaving(true);
    try{ await db.updateProduct(modal.data.id,{stock:modal.data.stock+q}); await reloadP(); setModal(null); showToast(`Added ${q} pcs!`); }
    catch(e){ showToast("Restock failed.","error"); }
    setSaving(false);
  };

  return (
    <div className="fade">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div className="syne" style={{ fontSize:26, fontWeight:800 }}>Inventory</div>
          <div style={{ color:T.muted, fontSize:14 }}>{products.length} products · {products.reduce((a,p)=>a+p.stock,0)} units · <span style={{ color:T.green }}>Supabase Synced ✓</span></div>
        </div>
        {isAdmin && <Btn onClick={()=>{ setForm({name:"",sizes:"",color:"",stock:0,retail_price:0,bulk_price:0,bulk_min_qty:12}); setModal({type:"product",data:null}); }}>+ Add Product</Btn>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
        {products.map(p=>(
          <Card key={p.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div><div className="syne" style={{ fontWeight:700, fontSize:15 }}>{p.name}</div><div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{p.color} · Sizes: {p.sizes}</div></div>
              <Badge color={p.stock<10?T.red:p.stock<20?T.accent:T.green}>{p.stock} pcs</Badge>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
              {[{label:"Retail Price",value:`Rs. ${p.retail_price}`,color:T.text},{label:"Bulk Price",value:`Rs. ${p.bulk_price}`,color:T.blue},{label:"Bulk Min Qty",value:`${p.bulk_min_qty} pcs`,color:T.muted},{label:"Stock Value",value:`Rs. ${(p.stock*p.retail_price).toLocaleString()}`,color:T.accent}]
              .map(item=>(
                <div key={item.label} style={{ background:T.bg, borderRadius:8, padding:"8px 12px" }}>
                  <div style={{ fontSize:10, color:T.muted }}>{item.label}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <Btn small variant="ghost" onClick={()=>{ setForm({qty:0}); setModal({type:"restock",data:p}); }}>+ Restock</Btn>
              {isAdmin&&<><Btn small variant="ghost" onClick={()=>{ setForm({name:p.name,sizes:p.sizes,color:p.color,stock:p.stock,retail_price:p.retail_price,bulk_price:p.bulk_price,bulk_min_qty:p.bulk_min_qty}); setModal({type:"product",data:p}); }}>Edit</Btn><Btn small variant="danger" onClick={()=>del(p.id)}>Delete</Btn></>}
            </div>
          </Card>
        ))}
      </div>
      {modal?.type==="product"&&(
        <Modal title={modal.data?"Edit Product":"Add Product"} onClose={()=>setModal(null)}>
          <Inp label="PRODUCT NAME" value={form.name}  onChange={v=>F("name",v)} />
          <Inp label="COLOR"        value={form.color} onChange={v=>F("color",v)} />
          <Inp label="SIZES"        value={form.sizes} onChange={v=>F("sizes",v)} placeholder="e.g. 6,7,8,9,10" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Inp label="STOCK"        value={form.stock}        onChange={v=>F("stock",v)}        type="number" min="0" />
            <Inp label="RETAIL PRICE" value={form.retail_price} onChange={v=>F("retail_price",v)} type="number" min="0" />
            <Inp label="BULK PRICE"   value={form.bulk_price}   onChange={v=>F("bulk_price",v)}   type="number" min="0" />
            <Inp label="BULK MIN QTY" value={form.bulk_min_qty} onChange={v=>F("bulk_min_qty",v)} type="number" min="1" />
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving?<Spin/>:"Save"}</Btn>
          </div>
        </Modal>
      )}
      {modal?.type==="restock"&&(
        <Modal title={`Restock: ${modal.data.name}`} onClose={()=>setModal(null)}>
          <div style={{ color:T.muted, marginBottom:16, fontSize:14 }}>Current stock: <b style={{ color:T.text }}>{modal.data.stock} pcs</b></div>
          <Inp label="ADD QUANTITY" value={form.qty} onChange={v=>F("qty",v)} type="number" min="1" />
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="success" onClick={doRestock} disabled={saving}>{saving?<Spin/>:"Confirm"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SALES PAGE ───────────────────────────────────────────────────────────────
function SalesPage({ products, sales, user, reload, showToast }) {
  const [pid,setPid]=useState(""); const [type,setType]=useState("Retail");
  const [qty,setQty]=useState(1); const [customer,setCustomer]=useState(""); const [note,setNote]=useState("");
  const [saving,setSaving]=useState(false);
  const prod=products.find(p=>p.id===pid);
  const isBulk=type==="Bulk";
  const price=prod?(isBulk&&qty>=prod.bulk_min_qty?prod.bulk_price:prod.retail_price):0;
  const total=price*qty;
  const inStock=prod?qty<=prod.stock:false;
  const submit=async()=>{
    if(!prod||qty<1||!inStock||saving) return; setSaving(true);
    try{
      await db.addSale({id:"s"+Date.now(),product_id:prod.id,product_name:prod.name,type,qty:parseInt(qty),price,total,customer,note,by_user:user.username,date:new Date().toISOString()});
      await db.updateProduct(prod.id,{stock:prod.stock-parseInt(qty)});
      await reload(); showToast(`Sale saved! Rs. ${total.toLocaleString()}`);
      setPid(""); setQty(1); setCustomer(""); setNote(""); setType("Retail");
    } catch(e){ showToast("Failed: "+e.message,"error"); }
    setSaving(false);
  };
  const todaySales=sales.filter(s=>new Date(s.date).toDateString()===new Date().toDateString());
  return (
    <div className="fade">
      <div className="syne" style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>Record Sale</div>
      <div style={{ color:T.muted, fontSize:14, marginBottom:24 }}>Saved directly to Supabase</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <Card>
          <div className="syne" style={{ fontWeight:700, marginBottom:18 }}>Sale Details</div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:T.muted, marginBottom:5, fontWeight:500 }}>PRODUCT</div>
            <select value={pid} onChange={e=>setPid(e.target.value)} style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:pid?T.text:T.muted, padding:"10px 13px", fontSize:14 }}>
              <option value="">Select product…</option>
              {products.map(p=><option key={p.id} value={p.id}>{p.name} ({p.color}) — Stock: {p.stock}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:T.muted, marginBottom:5, fontWeight:500 }}>SALE TYPE</div>
            <div style={{ display:"flex", gap:10 }}>
              {["Retail","Bulk"].map(t=>(
                <div key={t} onClick={()=>setType(t)} style={{ flex:1, textAlign:"center", padding:10, borderRadius:8, cursor:"pointer", border:`2px solid ${type===t?T.accent:T.border}`, color:type===t?T.accent:T.muted, background:type===t?`${T.accent}15`:"transparent", fontSize:14, fontWeight:500 }}>
                  {t==="Retail"?"🛒 Retail":"📦 Bulk"}
                </div>
              ))}
            </div>
          </div>
          <Inp label="QUANTITY (pcs)" value={qty} onChange={v=>setQty(Math.max(1,parseInt(v)||1))} type="number" min="1" />
          <Inp label="CUSTOMER NAME (optional)" value={customer} onChange={setCustomer} placeholder="Walk-in customer" />
          <Inp label="NOTE (optional)" value={note} onChange={setNote} placeholder="Any notes" />
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card style={{ background:prod?`${T.accent}0d`:T.card, border:`1px solid ${prod?T.accent+"44":T.border}` }}>
            <div className="syne" style={{ fontWeight:700, marginBottom:16 }}>Price Summary</div>
            {prod?(
              <>
                <Row label="Product"    value={prod.name} />
                <Row label="Unit Price" value={`Rs. ${price}`} highlight />
                <Row label="Quantity"   value={`${qty} pcs`} />
                {isBulk&&qty<prod.bulk_min_qty&&<div style={{ color:T.accent, fontSize:12, margin:"8px 0", background:`${T.accent}15`, borderRadius:6, padding:"6px 10px" }}>Add {prod.bulk_min_qty-qty} more pcs for bulk price</div>}
                {isBulk&&qty>=prod.bulk_min_qty&&<div style={{ color:T.green, fontSize:12, margin:"8px 0", background:`${T.green}15`, borderRadius:6, padding:"6px 10px" }}>✓ Bulk pricing applied!</div>}
                <div style={{ borderTop:`1px solid ${T.border}`, marginTop:12, paddingTop:12 }}><Row label="TOTAL" value={`Rs. ${total.toLocaleString()}`} large highlight /></div>
                <Row label="Stock After" value={`${prod.stock-qty} pcs`} color={!inStock?T.red:prod.stock-qty<20?T.accent:T.green} highlight={!inStock} />
              </>
            ):<div style={{ color:T.muted, fontSize:14 }}>Select a product to see pricing.</div>}
          </Card>
          {!inStock&&prod&&<div style={{ background:`${T.red}18`, border:`1px solid ${T.red}44`, borderRadius:10, padding:"14px 18px", color:T.red, fontSize:14 }}>⚠️ Only {prod.stock} pcs available.</div>}
          <Btn onClick={submit} disabled={!prod||!inStock||qty<1||saving} variant="success" style={{ width:"100%", padding:16, fontSize:16 }}>
            {saving?<Spin/>:`✓ Record Sale — Rs. ${total.toLocaleString()}`}
          </Btn>
        </div>
      </div>
      <Card style={{ marginTop:24 }}>
        <div className="syne" style={{ fontWeight:700, marginBottom:16 }}>Today's Transactions ({todaySales.length})</div>
        {todaySales.length===0?<div style={{ color:T.muted, fontSize:14 }}>No transactions today.</div>
        :todaySales.map(s=>(
          <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
            <div><div style={{ fontSize:13 }}>{s.product_name}</div><div style={{ fontSize:11, color:T.muted }}>{new Date(s.date).toLocaleTimeString()} · {s.customer||"Walk-in"} · by {s.by_user}</div></div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Badge color={s.type==="Bulk"?T.blue:T.muted}>{s.type} · {s.qty}pcs</Badge>
              <div style={{ fontWeight:600, color:T.green }}>Rs. {s.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({ products, sales }) {
  const [range,setRange]=useState("7");
  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-parseInt(range));
  const filtered=range==="9999"?sales:sales.filter(s=>new Date(s.date)>=cutoff);
  const totalRev=filtered.reduce((a,s)=>a+s.total,0);
  const totalQty=filtered.reduce((a,s)=>a+s.qty,0);
  const bulkN=filtered.filter(s=>s.type==="Bulk").length;
  const retailN=filtered.filter(s=>s.type==="Retail").length;
  const byProd={};
  filtered.forEach(s=>{ if(!byProd[s.product_id])byProd[s.product_id]={name:s.product_name,qty:0,revenue:0,bulk:0,retail:0}; byProd[s.product_id].qty+=s.qty;byProd[s.product_id].revenue+=s.total;s.type==="Bulk"?byProd[s.product_id].bulk++:byProd[s.product_id].retail++; });
  const bpArr=Object.values(byProd).sort((a,b)=>b.revenue-a.revenue);
  const maxRev=Math.max(...bpArr.map(b=>b.revenue),1);
  return (
    <div className="fade">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div><div className="syne" style={{ fontSize:26, fontWeight:800 }}>Reports</div><div style={{ color:T.muted, fontSize:14 }}>Live from Supabase</div></div>
        <div style={{ display:"flex", gap:8 }}>
          {[["7","7 Days"],["30","30 Days"],["90","90 Days"],["9999","All Time"]].map(([v,l])=>(
            <div key={v} onClick={()=>setRange(v)} style={{ padding:"8px 14px", borderRadius:8, cursor:"pointer", fontSize:13, background:range===v?T.accent:T.card, color:range===v?"#000":T.muted, border:`1px solid ${range===v?T.accent:T.border}`, fontWeight:range===v?600:400 }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[{label:"Revenue",value:`Rs. ${totalRev.toLocaleString()}`,color:T.accent},{label:"Units Sold",value:totalQty,color:T.green},{label:"Bulk Orders",value:bulkN,color:T.blue},{label:"Retail Orders",value:retailN,color:T.muted}]
        .map(s=><Card key={s.label} style={{ textAlign:"center" }}><div className="syne" style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div><div style={{ fontSize:12, color:T.muted, marginTop:4 }}>{s.label}</div></Card>)}
      </div>
      <Card style={{ marginBottom:20 }}>
        <div className="syne" style={{ fontWeight:700, marginBottom:20 }}>Revenue by Product</div>
        {bpArr.length===0?<div style={{ color:T.muted }}>No sales in this period.</div>
        :bpArr.map(p=>(
          <div key={p.name} style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div><span style={{ fontWeight:500 }}>{p.name}</span><span style={{ color:T.muted, fontSize:12, marginLeft:10 }}>{p.qty} pcs · {p.bulk} bulk / {p.retail} retail</span></div>
              <span style={{ fontWeight:700, color:T.accent }}>Rs. {p.revenue.toLocaleString()}</span>
            </div>
            <div style={{ height:8, background:T.border, borderRadius:4, overflow:"hidden" }}><div style={{ height:"100%", borderRadius:4, background:`linear-gradient(to right,${T.accent},${T.accent2})`, width:`${(p.revenue/maxRev)*100}%` }} /></div>
          </div>
        ))}
      </Card>
      <Card>
        <div className="syne" style={{ fontWeight:700, marginBottom:16 }}>Inventory Status</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ color:T.muted, borderBottom:`1px solid ${T.border}` }}>{["Product","Color","Sizes","Stock","Retail","Bulk","Min Qty","Status"].map(h=><th key={h} style={{ textAlign:"left", padding:"8px 10px", fontWeight:500, fontSize:11 }}>{h}</th>)}</tr></thead>
          <tbody>
            {products.map(p=>(
              <tr key={p.id} style={{ borderBottom:`1px solid ${T.border}` }}>
                <td style={{ padding:"10px", fontWeight:500 }}>{p.name}</td>
                <td style={{ padding:"10px", color:T.muted }}>{p.color}</td>
                <td style={{ padding:"10px", color:T.muted }}>{p.sizes}</td>
                <td style={{ padding:"10px" }}><Badge color={p.stock<10?T.red:p.stock<20?T.accent:T.green}>{p.stock}</Badge></td>
                <td style={{ padding:"10px" }}>Rs.{p.retail_price}</td>
                <td style={{ padding:"10px", color:T.blue }}>Rs.{p.bulk_price}</td>
                <td style={{ padding:"10px", color:T.muted }}>{p.bulk_min_qty}</td>
                <td style={{ padding:"10px" }}><Badge color={p.stock<10?T.red:p.stock<20?T.accent:T.green}>{p.stock<10?"Critical":p.stock<20?"Low":"OK"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
