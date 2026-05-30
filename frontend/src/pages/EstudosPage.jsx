import React from 'react';
import { FileText, Lightbulb, HelpCircle, Brain, ChevronRight, Calculator, Atom, Code2 } from 'lucide-react';

const actions = [
  { icon: FileText, label: 'Gerar resumo', desc: 'Resuma qualquer texto em segundos.', color: '#8250ff', prompt: 'Gere um resumo detalhado sobre o tema que eu enviar' },
  { icon: Lightbulb, label: 'Explicar conteúdo', desc: 'Entenda qualquer assunto de forma fácil.', color: '#00e5a0', prompt: 'Me explique um conteúdo de forma simples e didática' },
  { icon: HelpCircle, label: 'Gerar questões', desc: 'Crie questões sobre qualquer tema.', color: '#57b4ff', prompt: 'Crie 5 questões de múltipla escolha sobre o tema que eu enviar' },
  { icon: Brain, label: 'Mapa mental', desc: 'Gere mapas mentais personalizados.', color: '#ff8c57', prompt: 'Crie um mapa mental em formato de texto sobre o tema que eu enviar' },
];

const subjects = [
  { icon: Calculator, label: 'Matemática', color: '#8250ff' },
  { icon: Atom, label: 'Física', color: '#57b4ff' },
  { icon: Code2, label: 'Programação', color: '#00e5a0' },
  { icon: Brain, label: 'Biologia', color: '#ff8c57' },
];

export default function EstudosPage({ chat, onNavigate }) {
  const handleAction = (prompt) => {
    chat.sendMessage(prompt);
    onNavigate('chat');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>Estudos</h2>
      <p style={{ color: 'var(--text-3)', fontSize: '13px', marginBottom: '24px' }}>O que você quer fazer?</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        {actions.map(({ icon: Icon, label, desc, color, prompt }, i) => (
          <button key={label} onClick={() => handleAction(prompt)}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)', textAlign: 'left', transition: 'all 0.2s', animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '44'; e.currentTarget.style.background = 'var(--bg-4)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--r-sm)', background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{desc}</div>
            </div>
            <ChevronRight size={16} color="var(--text-4)" />
          </button>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Matérias</h3>
          <button style={{ fontSize: '13px', color: 'var(--purple-light)', fontWeight: 500 }}>Ver todas</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {subjects.map(({ icon: Icon, label, color }) => (
            <button key={label} onClick={() => handleAction(`Me ajude a estudar ${label}`)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color + '44'; e.currentTarget.style.background = 'var(--bg-4)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--r-sm)', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
