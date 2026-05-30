import React, { useState, useRef } from 'react';
import { FileText, Upload, Star, Trash2, Search, Plus } from 'lucide-react';

export default function PDFsPage({ chat, onNavigate }) {
  const [pdfs, setPdfs] = useState([
    { name: 'inteligencia-artificial.pdf', size: '2.4 MB', date: '10/05/2024', starred: true },
    { name: 'fisica-mecanica.pdf', size: '1.8 MB', date: '09/05/2024', starred: false },
    { name: 'resumo-redacao.pdf', size: '1.2 MB', date: '08/05/2024', starred: false },
    { name: 'historia-do-brasil.pdf', size: '3.1 MB', date: '07/05/2024', starred: false },
    { name: 'algoritmos-e-logica.pdf', size: '2.7 MB', date: '06/05/2024', starred: false },
  ]);
  const [tab, setTab] = useState('todos');
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') return;
    const result = await chat.handlePDFUpload(file);
    if (result) {
      setPdfs(prev => [{ name: file.name, size: (file.size / 1024 / 1024).toFixed(1) + ' MB', date: new Date().toLocaleDateString('pt-BR'), starred: false }, ...prev]);
      onNavigate('chat');
    }
  };

  const filtered = pdfs.filter(p => {
    if (tab === 'favoritos') return p.starred;
    if (search) return p.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const toggleStar = (name) => setPdfs(prev => prev.map(p => p.name === name ? { ...p, starred: !p.starred } : p));
  const remove = (name) => setPdfs(prev => prev.filter(p => p.name !== name));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Search */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-full)', padding: '10px 16px', marginBottom: '14px' }}>
          <Search size={16} color="var(--text-3)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar PDFs..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '14px' }} />
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          {['todos', 'recentes', 'favoritos'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '6px 16px', borderRadius: 'var(--r-full)', fontSize: '13px', fontWeight: 600, background: tab === t ? 'var(--purple-mid)' : 'none', color: tab === t ? 'var(--purple-light)' : 'var(--text-3)', border: `1px solid ${tab === t ? 'var(--border-purple)' : 'transparent'}`, transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {filtered.map((pdf, i) => (
          <div key={pdf.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border-1)', animation: `fadeUp 0.3s ease ${i * 0.05}s both`, cursor: 'pointer' }}
            onClick={() => { chat.handlePDFUpload(new File([], pdf.name, { type: 'application/pdf' })); onNavigate('chat'); }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--r-sm)', background: 'rgba(255,87,87,0.1)', border: '1px solid rgba(255,87,87,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={20} color="#ff5757" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pdf.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{pdf.size} · {pdf.date}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); toggleStar(pdf.name); }} style={{ color: pdf.starred ? 'var(--amber)' : 'var(--text-4)', transition: 'color 0.2s', padding: '4px' }}>
              <Star size={16} fill={pdf.starred ? 'var(--amber)' : 'none'} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); remove(pdf.name); }} style={{ color: 'var(--text-4)', transition: 'color 0.2s', padding: '4px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Upload button */}
      <div style={{ padding: '16px' }}>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} />
        <button onClick={() => fileRef.current?.click()}
          style={{ width: '100%', padding: '14px', background: 'var(--purple-mid)', border: '1px dashed var(--border-purple)', borderRadius: 'var(--r-lg)', color: 'var(--purple-light)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(130,80,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--purple-mid)'}>
          <Plus size={18} /> Enviar novo PDF
        </button>
      </div>
    </div>
  );
}
