'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { type TeacherRecord } from './types';
import './style.css';

const initialForm = {
  name: '', pid: '', designation: '', mobile: '', place_of_posting: '', semis_code: '', taluka: '',
  contractual_appointment: '', regularization_date: '', increments_claimed: '', arrears: '',
  recurring_annual_cost: '', pensionary_implications: ''
};

export default function DistrictEastTeachersPage() {
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editId, setEditId] = useState<string|undefined>(undefined);

  const totals = useMemo(() => ({
    arrears: records.reduce((s, r) => s + Number(r.arrears || 0), 0),
    annual: records.reduce((s, r) => s + Number(r.recurring_annual_cost || 0), 0)
  }), [records]);

  async function loadRecords() {
    setLoading(true);
    try {
      const res = await fetch('/api/teachers', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load records');
      setRecords(data.records || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load records');
    } finally {
      setLoading(false);
    }
  }

  async function checkAdmin() {
    const res = await fetch('/api/admin/session', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setIsAdmin(Boolean(data.authenticated));
    }
  }

  useEffect(() => { loadRecords(); checkAdmin(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const body = {
      id: editId || undefined,
      ...form,
      increments_claimed: Number(form.increments_claimed),
      arrears: Number(form.arrears),
      recurring_annual_cost: Number(form.recurring_annual_cost)
    };
    try {
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch('/api/teachers', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setForm(initialForm);
      setEditId(undefined);
      setMessage(editId ? 'Teacher record updated successfully.' : 'Teacher record submitted successfully.');
      await loadRecords();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Submission failed');
    } finally { setSaving(false); }
  }

  function startEdit(r: TeacherRecord) {
    setForm({
      name: r.name, pid: r.pid, designation: r.designation, mobile: r.mobile || '',
      place_of_posting: r.place_of_posting, semis_code: r.semis_code || '',
      taluka: r.taluka,
      contractual_appointment: r.contractual_appointment,
      regularization_date: r.regularization_date,
      increments_claimed: String(r.increments_claimed),
      arrears: String(r.arrears || ''),
      recurring_annual_cost: String(r.recurring_annual_cost || ''),
      pensionary_implications: r.pensionary_implications || ''
    });
    setEditId(r.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password })
    });
    if (res.ok) { setIsAdmin(true); setShowAdmin(false); setPassword(''); setMessage('Admin login successful.'); }
    else setMessage('Incorrect admin password.');
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAdmin(false);
    setMessage('Admin logged out.');
  }

  function printTable() {
    const printWin = window.open('', '_blank');
    if (!printWin) return setMessage('Please allow pop-ups for PDF export.');
    printWin.document.write(`
      <html><head><title>District East Teachers</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;color:#17231c}
        h1{font-size:22px;margin-bottom:5px}
        h2{font-size:16px;color:#555;margin-top:0}
        table{border-collapse:collapse;width:100%;margin-top:15px;font-size:12px}
        th{background:#07552f;color:#fff;padding:8px;text-align:left}
        td{padding:7px 8px;border:1px solid #ccc;vertical-align:top}
        tr:nth-child(even){background:#f5f8f6}
        small{display:block;color:#666;margin-top:2px}
        .print-meta{color:#666;font-size:13px;margin-top:20px}
        @media print{body{padding:10px}table{font-size:10px}th{padding:5px}td{padding:4px 5px}}
      </style></head><body>
      <h1>Government of Sindh</h1>
      <h2>School Education & Literacy Department — District East, Karachi</h2>
      <p><strong>Employee-wise Statement — Teacher Records</strong></p>
      <table><thead><tr>
        <th>S.No</th><th>Name</th><th>PID</th><th>Designation</th><th>Mobile</th>
        <th>Place of Posting</th><th>SEMIS Code</th><th>Taluka</th>
        <th>Contract Date</th><th>Regularization</th><th>Increments</th>
        <th>Arrears</th><th>Annual Cost</th><th>Pensionary Imp.</th>
      </tr></thead><tbody>
      ${records.map((r,i)=>`<tr>
        <td>${i+1}</td>
        <td><b>${r.name}</b></td>
        <td>${r.pid}</td>
        <td>${r.designation}</td>
        <td>${r.mobile||'-'}</td>
        <td>${r.place_of_posting}${r.semis_code?`<small>SEMIS: ${r.semis_code}</small>`:''}</td>
        <td>${r.semis_code||'-'}</td>
        <td>${r.taluka}</td>
        <td>${r.contractual_appointment}</td>
        <td>${r.regularization_date}</td>
        <td>${r.increments_claimed}</td>
        <td>Rs. ${Number(r.arrears).toLocaleString('en-PK')}</td>
        <td>Rs. ${Number(r.recurring_annual_cost).toLocaleString('en-PK')}</td>
        <td>${r.pensionary_implications||'-'}</td>
      </tr>`).join('')}
      </tbody></table>
      <p class="print-meta">Generated on ${new Date().toLocaleString('en-PK')} — ${records.length} record(s)</p>
      <script>window.onload=function(){window.print();window.close()}<\/script>
      </body></html>`);
    printWin.document.close();
  }

  async function clearAll() {
    if (!confirm('Are you sure you want to permanently delete all teacher records?')) return;
    const res = await fetch('/api/admin/clear', { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error || 'Unable to clear records');
    setMessage('All records cleared by admin.');
    loadRecords();
  }

  function update(name: keyof typeof form, value: string) { setForm(prev => ({ ...prev, [name]: value })); }
  const money = (n: number) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

  return (
    <main className="de-wrap">
      <header className="de-hero">
        <div className="de-seal">سندھ</div>
        <div><span className="de-urgent">MOST URGENT</span><h1>Government of Sindh</h1><h2>School Education & Literacy Department</h2><p>District East, Karachi — Employee-wise Data Collection</p></div>
      </header>

      <section className="de-notice"><b>Subject:</b> Clarification for Pay Fixation of Teachers Appointed as per Recruitment Policy, 2008<br/><span>Reference: SO(P-I)/PP/2-435/2026 dated 27 July 2026</span></section>

      {isAdmin && <section className="de-stats">
        <div><strong>{records.length}</strong><span>Total Records</span></div>
        <div><strong>{money(totals.arrears)}</strong><span>Total Arrears</span></div>
        <div><strong>{money(totals.annual)}</strong><span>Annual Recurring Cost</span></div>
      </section>}

      <section className="de-card">
        <div className="de-title"><div className="de-check">{editId?'✏️':'✓'}</div><div><h3>{editId?'Edit Teacher Record':'Teacher Information Form'}</h3><p>Fields marked * are mandatory. Verify entries from service and pay records.</p></div></div>
        <form onSubmit={submit} className="de-form">
          {[
            ['name','Name of affected teacher *','text'],['pid','PID / Personnel No. *','text'],['designation','Designation *','text'],
            ['mobile','Mobile Number','tel'],['place_of_posting','Place of Posting / School *','text'],
            ['semis_code','SEMIS Code','text'],['contractual_appointment','Date of Contractual Appointment *','date'],
            ['regularization_date','Date of Regularization *','date'],['increments_claimed','Increments Claimed *','number'],
            ['arrears','Arrears (Rs.)','number'],['recurring_annual_cost','Recurring Annual Cost (Rs.)','number'],
            ['pensionary_implications','Pensionary Implications','text']
          ].map(([name,label,type]) => <label key={name}><span>{label}</span><input type={type} min={type==='number'?0:undefined} required={label.includes('*')} value={form[name as keyof typeof form]} onChange={e=>update(name as keyof typeof form,e.target.value)} /></label>)}
          <label><span>Taluka *</span><select required value={form.taluka} onChange={e=>update('taluka',e.target.value)}><option value="">Select Taluka</option><option>Gulshan-e-Iqbal</option><option>Jamshed Town</option><option>Ferozabad</option><option>Gulzar-e-Hijri</option></select></label>
          <div className="de-actions de-wide"><button className="de-primary" disabled={saving}>{saving?'Saving...':editId?'✏️ Update Record':'＋ Submit Teacher Record'}</button><button type="button" onClick={()=>{setForm(initialForm);setEditId(undefined);}}>Clear Form</button></div>
        </form>
        {message && <p className="de-message">{message}</p>}
      </section>

      <section className="de-card">
        <div className="de-record-head"><div><h3>Employee-wise Statement</h3><p>{isAdmin?'Manage, edit, export or clear teacher records.':'🔒 Login as admin to view and manage records.'}</p></div><div className="de-actions">
          {isAdmin ? <><a className="de-button" href="/api/admin/export">⬇ CSV</a><a className="de-button" href="/api/admin/export/xlsx">⬇ Excel</a><button className="de-button" onClick={printTable}>📄 PDF</button><button className="de-danger" onClick={clearAll}>✕ Clear All</button><button onClick={logout}>Logout</button></> : <button onClick={()=>setShowAdmin(v=>!v)}>🔑 Admin Login</button>}
        </div></div>
        {showAdmin && !isAdmin && <form onSubmit={login} className="de-admin"><div className="de-pw-wrap"><input type={showPassword?'text':'password'} placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" className="de-eye" onClick={()=>setShowPassword(v=>!v)} tabIndex={-1}>{showPassword?'🙈':'👁️'}</button></div><button className="de-primary">Login</button></form>}
        {isAdmin ? <div className="de-table-wrap"><table><thead><tr><th>S.No</th><th>Name / PID / Designation</th><th>Place of Posting</th><th>Contract Date</th><th>Regularization</th><th>Increments</th><th>Arrears</th><th>Annual Cost</th><th>Pensionary Implications</th><th></th></tr></thead><tbody>
          {loading ? <tr><td colSpan={10} className="de-empty">Loading records...</td></tr> : records.length ? records.map((r,i)=><tr key={r.id}><td>{i+1}</td><td><b>{r.name}</b><small>{r.pid} · {r.designation}</small></td><td>{r.place_of_posting}<small>{r.semis_code||'No SEMIS'} · {r.taluka}</small></td><td>{r.contractual_appointment}</td><td>{r.regularization_date}</td><td>{r.increments_claimed}</td><td>{money(r.arrears)}</td><td>{money(r.recurring_annual_cost)}</td><td>{r.pensionary_implications}</td><td><button className="de-edit-btn" onClick={()=>startEdit(r)}>✏️</button></td></tr>) : <tr><td colSpan={10} className="de-empty">No teacher records submitted yet.</td></tr>}
        </tbody></table></div> : <p className="de-locked">🔒 Records are hidden. Please login as admin to view, edit, and export data.</p>}
      </section>
    </main>
  );
}
