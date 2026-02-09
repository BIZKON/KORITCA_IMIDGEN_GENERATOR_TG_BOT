'use client';

import { useState } from 'react';

// iPhone Frame Component
function IPhoneFrame({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div style={{
      width: 375,
      height: 812,
      borderRadius: 44,
      border: '8px solid #1a1a1a',
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 25px 80px rgba(0,0,0,0.4), 0 0 0 2px #333 inset',
      flexShrink: 0,
      margin: '0 auto',
    }}>
      {/* Notch */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 160,
        height: 30,
        background: '#1a1a1a',
        borderRadius: '0 0 20px 20px',
        zIndex: 100,
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#0a0a0a',
          position: 'absolute',
          right: 30,
          top: 8,
        }} />
      </div>

      {/* Status Bar */}
      <div style={{
        height: 50,
        background: 'inherit',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 24px 4px',
        position: 'relative',
        zIndex: 50,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>9:41</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><rect x="0" y="6" width="3" height="6" rx="0.5"/><rect x="4.5" y="4" width="3" height="8" rx="0.5"/><rect x="9" y="1.5" width="3" height="10.5" rx="0.5"/><rect x="13" y="0" width="3" height="12" rx="0.5"/></svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="white"><rect x="0" y="1" width="20" height="10" rx="2" stroke="white" strokeWidth="1" fill="none"/><rect x="2" y="3" width="15" height="6" rx="1" fill="#4ADE80"/><rect x="21" y="4" width="3" height="4" rx="1"/></svg>
        </div>
      </div>

      {/* Screen Content */}
      <div style={{
        height: 'calc(100% - 50px)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {children}
      </div>

      {/* Home Indicator */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 134,
        height: 5,
        borderRadius: 100,
        background: 'rgba(255,255,255,0.3)',
        zIndex: 100,
      }} />
    </div>
  );
}

// Home Screen Component
function HomeScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div style={{ height: '100%', background: '#FDF5E6', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 48, marginBottom: 2 }}>🍪</div>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #C67B3C, #8B4513)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: -0.5,
          }}>Пряничная школа</div>
        </div>

        <div style={{ fontSize: 17, color: '#5D4037', fontWeight: 500, marginBottom: 16, textAlign: 'center' }}>
          Привет, Анна! 👋
        </div>

        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #C67B3C 0%, #E8A665 100%)',
          borderRadius: 16,
          padding: '18px 20px',
          marginBottom: 16,
          color: '#fff',
          boxShadow: '0 8px 24px rgba(198,123,60,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.9 }}>Баланс генераций</span>
            <span style={{ fontSize: 13, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20 }}>
              Базовый
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>73 <span style={{ fontSize: 16, fontWeight: 400, opacity: 0.8 }}>из 100</span></div>
          <div style={{
            height: 6,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 100,
            overflow: 'hidden',
          }}>
            <div style={{
              width: '73%',
              height: '100%',
              background: '#fff',
              borderRadius: 100,
            }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Действует до 28 марта 2026</div>
        </div>

        {/* CTA Button */}
        <button onClick={() => onNavigate('create')} style={{
          width: '100%',
          background: 'linear-gradient(135deg, #C67B3C 0%, #D4915A 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          padding: '16px 0',
          fontSize: 17,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(198,123,60,0.35)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          🎨 Создать дизайн
        </button>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '🖼', label: 'Галерея', count: '12' },
            { icon: '📚', label: 'Библиотека', count: '30' },
            { icon: '🤝', label: 'Рефералы', count: '3' },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: 14,
              padding: '14px 8px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 12, color: '#5D4037', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#A1887F', marginTop: 2 }}>{item.count}</div>
            </div>
          ))}
        </div>

        {/* Subscription Warning */}
        <div style={{
          background: '#FFF3CD',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid #FFE08A',
        }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#856404' }}>Подписка заканчивается</div>
            <div style={{ fontSize: 12, color: '#856404', opacity: 0.8 }}>Осталось 3 дня · Продлить →</div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}

// Create Screen Component
function CreateScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div style={{ height: '100%', background: '#FDF5E6', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid #F0E0C9',
      }}>
        <svg onClick={() => onNavigate('home')} width="24" height="24" fill="#5D4037" viewBox="0 0 24 24" style={{ cursor: 'pointer' }}><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#5D4037' }}>Создать дизайн</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* AI Assistant Hint */}
        <div style={{
          background: 'linear-gradient(135deg, #E8F0FE, #D4E4FC)',
          borderRadius: 14,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a56db' }}>AI-помощник</div>
            <div style={{ fontSize: 12, color: '#3b6ecc', lineHeight: 1.5 }}>
              Опишите пряник на русском языке — я автоматически создам профессиональный промпт для генерации
            </div>
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{
            flex: 1,
            background: '#C67B3C',
            color: '#fff',
            borderRadius: 10,
            padding: '10px 0',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}>💬 Текст</div>
          <div style={{
            flex: 1,
            background: '#fff',
            color: '#8D6E63',
            borderRadius: 10,
            padding: '10px 0',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid #E0D0BD',
          }}>📚 Библиотека</div>
        </div>

        {/* Textarea */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '2px solid #E0D0BD',
          padding: '14px',
          marginBottom: 14,
          minHeight: 100,
        }}>
          <div style={{ color: '#C67B3C', fontSize: 14, lineHeight: 1.6 }}>
            Пряник в виде ёлочной игрушки, красная и золотая глазурь, блёстки, надпись "С Новым Годом"
          </div>
        </div>

        {/* AI Suggestions */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#8D6E63', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>✨</span> AI-подсказки
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['🎄 Новогодний', '❤️ С сердцем', '🦋 Бабочка', '🌸 Весенний', '👶 Детский'].map((tag, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid #E0D0BD',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 12,
                color: '#5D4037',
                cursor: 'pointer',
              }}>{tag}</div>
            ))}
          </div>
        </div>

        {/* Style Selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#8D6E63', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🎨</span> Стиль генерации
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { name: 'Фотореализм', icon: '📷', active: true },
              { name: 'Иллюстрация', icon: '🖌' },
              { name: 'Акварель', icon: '💧' },
              { name: 'Контур', icon: '✏️' },
            ].map((s, i) => (
              <div key={i} style={{
                background: s.active ? 'linear-gradient(135deg, #C67B3C, #E8A665)' : '#fff',
                color: s.active ? '#fff' : '#5D4037',
                borderRadius: 12,
                padding: '12px',
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: s.active ? 'none' : '1px solid #E0D0BD',
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                {s.name}
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '14px',
          marginBottom: 16,
          border: '1px solid #F0E0C9',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#8D6E63', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>⚙️</span> Настройки
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#5D4037' }}>Качество</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{
                background: '#E8A665',
                color: '#fff',
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 8,
                fontWeight: 600,
              }}>Standard</span>
              <span style={{
                background: '#F0E0C9',
                color: '#8D6E63',
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 8,
              }}>Developer</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#5D4037' }}>Формат</span>
            <span style={{ fontSize: 13, color: '#8D6E63' }}>1024×1024</span>
          </div>
        </div>
      </div>

      {/* Main Button */}
      <div onClick={() => onNavigate('generating')} style={{
        background: '#C67B3C',
        color: '#fff',
        textAlign: 'center',
        padding: '16px 0 32px',
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
      }}>
        ✨ Создать дизайн — 1 генерация
      </div>
    </div>
  );
}

// Generating Screen Component
function GeneratingScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [progress] = useState(65);

  return (
    <div style={{ height: '100%', background: '#FDF5E6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '0 40px' }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #F5DEB3, #DEB887)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <div style={{ fontSize: 60 }}>🍪</div>
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: '#5D4037', marginBottom: 8 }}>
          Создаём дизайн...
        </div>
        <div style={{ fontSize: 14, color: '#8D6E63', marginBottom: 24, lineHeight: 1.6 }}>
          AI анализирует ваше описание и<br />генерирует уникальный дизайн пряника
        </div>

        <div style={{
          width: '100%',
          height: 8,
          background: 'rgba(198, 123, 60, 0.15)',
          borderRadius: 100,
          overflow: 'hidden',
          marginBottom: 12,
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #C67B3C, #E8A665)',
            borderRadius: 100,
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ fontSize: 13, color: '#8D6E63' }}>
          {progress}% завершено
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

// Result Screen Component
function ResultScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div style={{ height: '100%', background: '#FDF5E6', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid #F0E0C9',
      }}>
        <svg onClick={() => onNavigate('home')} width="24" height="24" fill="#5D4037" viewBox="0 0 24 24" style={{ cursor: 'pointer' }}><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#5D4037' }}>Ваш дизайн</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Generated Image */}
        <div style={{
          width: '100%',
          aspectRatio: '1 / 1',
          background: 'linear-gradient(135deg, #E8A665, #C67B3C)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          fontSize: 80,
        }}>
          🍪
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button style={{
            flex: 1,
            background: '#FFF',
            border: '2px solid #E0D0BD',
            color: '#5D4037',
            borderRadius: 12,
            padding: '12px 0',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            📥 Загрузить
          </button>
          <button style={{
            flex: 1,
            background: '#FFF',
            border: '2px solid #E0D0BD',
            color: '#5D4037',
            borderRadius: 12,
            padding: '12px 0',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            ❤️ Понравилось
          </button>
        </div>

        {/* Regenerate */}
        <button onClick={() => onNavigate('create')} style={{
          width: '100%',
          background: 'linear-gradient(135deg, #C67B3C, #E8A665)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 0',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 16,
        }}>
          🔄 Создать ещё один
        </button>

        {/* Details */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '14px',
          border: '1px solid #F0E0C9',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#8D6E63', marginBottom: 10 }}>Информация</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#5D4037' }}>Время генерации</span>
            <span style={{ fontSize: 12, color: '#8D6E63' }}>12 сек</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#5D4037' }}>Расход генераций</span>
            <span style={{ fontSize: 12, color: '#8D6E63' }}>-1 (осталось 72)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ active, onNavigate }: { active: string; onNavigate: (screen: string) => void }) {
  const items = [
    { id: 'home', icon: '🏠', label: 'Главная' },
    { id: 'gallery', icon: '🖼', label: 'Галерея' },
    { id: 'subscription', icon: '💳', label: 'Подписка' },
    { id: 'profile', icon: '👤', label: 'Профиль' },
  ];

  return (
    <div style={{
      background: '#fff',
      borderTop: '1px solid #F0E0C9',
      display: 'flex',
      padding: '6px 0 20px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
    }}>
      {items.map(item => (
        <div key={item.id} onClick={() => onNavigate(item.id)} style={{
          flex: 1,
          textAlign: 'center',
          cursor: 'pointer',
          padding: '6px 0',
        }}>
          <div style={{ fontSize: 20, opacity: active === item.id ? 1 : 0.4 }}>{item.icon}</div>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: active === item.id ? '#C67B3C' : '#A1887F',
            marginTop: 2,
          }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Main App Component
export default function MiniApp() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'create':
        return <CreateScreen onNavigate={setCurrentScreen} />;
      case 'generating':
        return <GeneratingScreen onNavigate={setCurrentScreen} />;
      case 'result':
        return <ResultScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <IPhoneFrame title="Пряничная школа">
        {renderScreen()}
      </IPhoneFrame>
    </div>
  );
}
