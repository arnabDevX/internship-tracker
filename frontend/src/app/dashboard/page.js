"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState({ company:"", role:"", status:"Applied", appliedDate:"", notes:"" });
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ company:"", role:"", status:"Applied", appliedDate:"", notes:"" });
  const [view, setView] = useState("home"); // home | add | show
  const [flash, setFlash] = useState("");
  const [centerPopup, setCenterPopup] = useState(null); // {type:'success'|'confirm'|'edit', data:any}
  const [typed, setTyped] = useState("");
  const fullText = "Keep track of your internship at one place";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    fetch("http://127.0.0.1:5050/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(async data => {
        setUser(data);
        const token = localStorage.getItem("token");
        const appRes = await fetch("http://127.0.0.1:5050/api/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appData = await appRes.json();
        setApplications(appData);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/");
      });
  }, []);

  useEffect(()=>{
    if(view!=="home") return;
    setTyped("");
    let i=0;
    const id=setInterval(()=>{
      i++;
      setTyped(fullText.slice(0,i));
      if(i>=fullText.length) clearInterval(id);
    },30);
    return ()=>clearInterval(id);
  },[view]);

  const logout = () => {
    setCenterPopup({type:'logoutConfirm'});
  };

  const createApplication = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setCreating(true);
    try {
      if (!form.company.trim() || !form.role.trim() || !form.appliedDate) {
        alert("Please fill Company, Role and Date");
        setCreating(false);
        return;
      }
      const payload = { companyName: form.company, role: form.role, status: form.status.toUpperCase(), appliedDate: new Date(form.appliedDate).toISOString(), notes: form.notes || null };
      const res = await fetch("http://127.0.0.1:5050/api/applications", {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || "Failed to create");
      setApplications(prev => [data, ...prev]);
      setCenterPopup({type:'success', message:'Application added successfully'});
      setView('home');
      setTimeout(()=>setCenterPopup(null),1800);
    } catch(err) {
      alert(err.message);
    } finally { setCreating(false); }
  };

  const deleteApplication = (id) => {
    setCenterPopup({type:'confirm', id});
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    const id = centerPopup.id;
    const res = await fetch(`http://127.0.0.1:5050/api/applications/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    if(res.ok) {
      setApplications(prev=>prev.filter(a=>a.id!==id));
      setCenterPopup({type:'success', message:'Application deleted'});
      setTimeout(()=>setCenterPopup(null),1500);
    } else setCenterPopup(null);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    setCenterPopup({type:'success', message:'Logged out successfully'});
    setTimeout(()=>router.push("/"),900);
  };

  const startEdit = (app) => {
    setEditId(app.id);
    setEditForm({ company:app.companyName || app.company || "", role:app.role, status:app.status, appliedDate:app.appliedDate?.slice(0,10)||"", notes:app.notes||"" });
    setCenterPopup({type:'edit'});
  };

  const saveEdit = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:5050/api/applications/${id}`, { method:"PUT", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body: JSON.stringify({ companyName: editForm.company, role: editForm.role, status: editForm.status.toUpperCase(), appliedDate: new Date(editForm.appliedDate).toISOString(), notes: editForm.notes || null })});
    const data = await res.json();
    if(res.ok){
      setApplications(prev=>prev.map(a=>a.id===id?data:a));
      setEditId(null);
      setCenterPopup({type:'success', message:'Application updated successfully'});
      setTimeout(()=>setCenterPopup(null),1500);
    } else alert(data.message||"Update failed");
  };

  if (loading) return <div style={{padding:40}}>Loading Dashboard...</div>;

  const stats = {
    total: applications.length,
    interview: applications.filter(a=>a.status==="INTERVIEW").length,
    offer: applications.filter(a=>a.status==="OFFER").length,
    rejected: applications.filter(a=>a.status==="REJECTED").length
  };
  stats.success = stats.total ? Math.round((stats.offer / stats.total) * 100) : 0;

  const statusStyles = {
    APPLIED: { background: '#e0f2fe', color: '#0369a1' },
    INTERVIEW: { background: '#fef3c7', color: '#92400e' },
    OFFER: { background: '#d1fae5', color: '#065f46' },
    REJECTED: { background: '#fee2e2', color: '#7f1d1d' }
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f5f7fb"}}>
      <style>{`@keyframes blink{0%,50%,100%{opacity:1}25%,75%{opacity:0}}`}</style>
      {/* Sidebar */}
      <div style={{
        width:"230px",
        padding:"25px",
        backdropFilter:"blur(14px)",
        background:"rgba(17,24,39,0.85)",
        color:"#fff",
        display:"flex",
        flexDirection:"column",
        gap:"14px",
        boxShadow:"inset -1px 0 0 rgba(255,255,255,0.1)"
      }}>
        <h2 style={{marginBottom:"10px",fontWeight:"700"}}>🎯 Tracker</h2>
        <button
          onClick={()=>setView("home")}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 14px rgba(255,255,255,0.6)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
          style={{
            padding:"10px",
            borderRadius:"10px",
            background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.18)",
            color:"#fff",
            textAlign:"left",
            transition:"all .25s"
          }}
        >🏠 Home</button>
        <button
          onClick={()=>setView("add")}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 14px rgba(255,255,255,0.6)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
          style={{
            padding:"10px",
            borderRadius:"10px",
            background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.18)",
            color:"#fff",
            textAlign:"left",
            transition:"all .25s"
          }}
        >➕ Add Application</button>
        <button
          onClick={()=>setView("show")}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 14px rgba(255,255,255,0.6)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
          style={{
            padding:"10px",
            borderRadius:"10px",
            background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.18)",
            color:"#fff",
            textAlign:"left",
            transition:"all .25s"
          }}
        >📋 Show Applications</button>
      </div>
      <div style={{flex:1,padding:"30px"}}>

      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        background:"#ffe4e6",
        padding:"20px 30px",
        borderRadius:"12px",
        boxShadow:"0 4px 15px rgba(0,0,0,0.08)"
      }}>
        <div>
          <h2 style={{margin:0}}>Welcome, {user.name}</h2>
          <p style={{margin:0,color:"#777"}}>{user.email}</p>
        </div>

        <button onClick={logout} style={{
          background:"#ef4444",
          color:"#fff",
          padding:"10px 18px",
          borderRadius:"8px",
          border:"none",
          cursor:"pointer"
        }}>
          Logout
        </button>
      </div>

      {view==="home" && (
        <div style={{height:"70vh",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px",fontWeight:"600",color:"#374151"}}>
          {typed}<span style={{display:'inline-block',marginLeft:'2px',width:'10px',animation:'blink 1s infinite'}}>|</span>
        </div>
      )}
      
      {flash && (
        <div style={{background:"#d1fae5",color:"#065f46",padding:"10px 15px",borderRadius:"8px",marginTop:"15px",width:"fit-content"}}>{flash}</div>
      )}

      {/* Stats Cards */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
        gap:"20px",
        marginTop:"25px"
      }}>
        {[
          ["Total", stats.total, "#3b82f6"],
          ["Interviews", stats.interview, "#f59e0b"],
          ["Offers", stats.offer, "#10b981"],
          ["Rejected", stats.rejected, "#ef4444"],
          ["Success %", stats.success+"%", "#6366f1"]
        ].map(([label,value,color])=>(
          <div key={label} style={{
            background:"#fff",
            padding:"20px",
            borderRadius:"14px",
            boxShadow:"0 4px 18px rgba(0,0,0,0.08)",
            borderLeft:`6px solid ${color}`
          }}>
            <div style={{fontSize:"14px",color:"#777"}}>{label}</div>
            <div style={{fontSize:"26px",fontWeight:"bold"}}>{value}</div>
          </div>
        ))}
      </div>

      {view==="add" && (
      <div style={{
        marginTop:"30px",
        background:"#fff",
        padding:"30px",
        borderRadius:"12px",
        boxShadow:"0 4px 15px rgba(0,0,0,0.08)"
      }}>
        <h3>Add Application</h3>
        <form onSubmit={createApplication} style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"10px",margin:"10px 0 20px"}}>
          <input placeholder="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} required style={{padding:"8px",borderRadius:"6px",border:"1px solid #ccc"}} />
          <input placeholder="Role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} required style={{padding:"8px",borderRadius:"6px",border:"1px solid #ccc"}} />
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:"8px",borderRadius:"6px"}}>
            <option>Applied</option><option>Interview</option><option>Offer</option><option>Rejected</option>
          </select>
          <input type="date" value={form.appliedDate} onChange={e=>setForm({...form,appliedDate:e.target.value})} style={{padding:"8px",borderRadius:"6px",border:"1px solid #ccc"}} />
          <input placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{padding:"8px",borderRadius:"6px",border:"1px solid #ccc"}} />
          <button type="submit" disabled={creating} style={{gridColumn:"1/-1",background:"#111",color:"#fff",padding:"10px",borderRadius:"8px",border:"none",cursor:"pointer"}}>{creating?"Adding...":"Add Application"}</button>
        </form>
      </div>
      )}

      {view==="show" && (
      <>
      {/* Placeholder Section */}
      <div style={{
        marginTop:"30px",
        background:"#fff",
        padding:"30px",
        borderRadius:"12px",
        boxShadow:"0 4px 15px rgba(0,0,0,0.08)"
      }}>
        <h3>Your Applications</h3>
        <div style={{display:"flex",gap:"10px",margin:"15px 0"}}>
          <input
            placeholder="Search company..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            style={{padding:"8px",borderRadius:"6px",border:"1px solid #ccc"}}
          />
          <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}
            style={{padding:"8px",borderRadius:"6px"}}>
            <option>All</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"#f1f3f7"}}>
              <th style={{padding:"10px"}}>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications
              .filter(app =>
                (app.companyName || app.company || "").toLowerCase().includes(search.toLowerCase()) &&
                (statusFilter==="All" || app.status===statusFilter)
              )
              .map(app => (
              <tr key={app.id} style={{borderBottom:"1px solid #eee"}}>
                <>
                  <td style={{padding:"10px"}}>{app.companyName || app.company}</td>
                  <td>{app.role}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '600',
                      ...(statusStyles[app.status] || {})
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                  <td>{app.notes}</td>
                  <td style={{whiteSpace:"nowrap"}}>
                    <button
                      style={{
                        background:"#3b82f6",
                        color:"#fff",
                        border:"none",
                        padding:"6px 12px",
                        borderRadius:"6px",
                        marginRight:"10px"
                      }}
                      onClick={()=>startEdit(app)}
                    >
                      Edit
                    </button>

                    <button
                      style={{
                        background:"#ef4444",
                        color:"#fff",
                        border:"none",
                        padding:"6px 12px",
                        borderRadius:"6px"
                      }}
                      onClick={()=>deleteApplication(app.id)}
                    >
                      Delete
                    </button>
                  </td>
                </>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}

    {centerPopup && (
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.25)',backdropFilter:'blur(6px)',zIndex:50}}>
        <div style={{background:'rgba(255,255,255,0.65)',backdropFilter:'blur(16px)',padding:'30px',borderRadius:'18px',boxShadow:'0 0 40px rgba(99,102,241,0.45)',minWidth:'320px',textAlign:'center'}}>
          {centerPopup.type==='success' && (
            <h3 style={{fontSize:'20px',fontWeight:600}}>{centerPopup.message}</h3>
          )}
          {centerPopup.type==='confirm' && (
            <>
              <h3 style={{marginBottom:'15px'}}>Confirm delete?</h3>
              <button onClick={confirmDelete} style={{background:'#ef4444',color:'#fff',padding:'8px 14px',border:'none',borderRadius:'8px',marginRight:'10px'}}>Delete</button>
              <button onClick={()=>setCenterPopup(null)} style={{background:'#e5e7eb',padding:'8px 14px',border:'none',borderRadius:'8px'}}>Cancel</button>
            </>
          )}
          {centerPopup.type==='logoutConfirm' && (
            <>
              <h3 style={{marginBottom:'15px'}}>Are you sure you want to logout?</h3>
              <button onClick={confirmLogout} style={{background:'#ef4444',color:'#fff',padding:'8px 14px',border:'none',borderRadius:'8px',marginRight:'10px'}}>Logout</button>
              <button onClick={()=>setCenterPopup(null)} style={{background:'#e5e7eb',padding:'8px 14px',border:'none',borderRadius:'8px'}}>Cancel</button>
            </>
          )}
          {centerPopup.type==='edit' && (
            <div style={{
              display:'flex',
              flexDirection:'column',
              gap:'14px',
              minWidth:'460px'
            }}>

              <input
                style={{padding:'10px',borderRadius:'8px',border:'1px solid #ccc'}}
                placeholder="Company"
                value={editForm.company}
                onChange={e=>setEditForm({...editForm,company:e.target.value})}
              />

              <input
                style={{padding:'10px',borderRadius:'8px',border:'1px solid #ccc'}}
                placeholder="Role"
                value={editForm.role}
                onChange={e=>setEditForm({...editForm,role:e.target.value})}
              />

              <select
                style={{padding:'10px',borderRadius:'8px',border:'1px solid #ccc'}}
                value={editForm.status}
                onChange={e=>setEditForm({...editForm,status:e.target.value})}
              >
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>

              <input
                type='date'
                style={{padding:'10px',borderRadius:'8px',border:'1px solid #ccc'}}
                value={editForm.appliedDate}
                onChange={e=>setEditForm({...editForm,appliedDate:e.target.value})}
              />

              <input
                style={{padding:'10px',borderRadius:'8px',border:'1px solid #ccc'}}
                placeholder="Notes"
                value={editForm.notes}
                onChange={e=>setEditForm({...editForm,notes:e.target.value})}
              />

              <div style={{
                display:'flex',
                justifyContent:'center',
                gap:'18px',
                marginTop:'12px'
              }}>
                <div style={{background:'#dbeafe',padding:'12px 20px',borderRadius:'14px',boxShadow:'0 0 20px rgba(59,130,246,0.25)'}}>
                  <button
                    style={{background:'#2563eb',color:'#fff',border:'none',padding:'8px 18px',borderRadius:'8px',cursor:'pointer'}}
                    onClick={()=>saveEdit(editId)}
                  >
                    Save
                  </button>
                </div>

                <div style={{background:'#fee2e2',padding:'12px 20px',borderRadius:'14px',boxShadow:'0 0 20px rgba(239,68,68,0.25)'}}>
                  <button
                    style={{background:'#ef4444',color:'#fff',border:'none',padding:'8px 18px',borderRadius:'8px',cursor:'pointer'}}
                    onClick={()=>setCenterPopup(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    </div>
    </div>
  );
}
