import { useState } from "react";

const screens = [
  "bot",
  "home",
  "create",
  "generating",
  "result",
  "library",
  "gallery",
  "subscription",
  "profile",
];

const screenNames = {
  bot: "Telegram Бот",
  home: "Главная",
  create: "Создание",
  generating: "Генерация...",
  result: "Результат",
  library: "Библиотека",
  gallery: "Галерея",
  subscription: "Подписка",
  profile: "Профиль",
};

// iPhone Frame
function IPhoneFrame({ children, title }) {
  return (
    <div style={{
      width: 375,
      height: 812,
      borderRadius: 44,
      border: "8px solid #1a1a1a",
      background: "#000",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 25px 80px rgba(0,0,0,0.4), 0 0 0 2px #333 inset",
      flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 160,
        height: 30,
        background: "#1a1a1a",
        borderRadius: "0 0 20px 20px",
        zIndex: 100,
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#0a0a0a",
          position: "absolute",
          right: 30,
          top: 8,
        }} />
      </div>
      {/* Status Bar */}
      <div style={{
        height: 50,
        background: "inherit",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "0 24px 4px",
        position: "relative",
        zIndex: 50,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><rect x="0" y="6" width="3" height="6" rx="0.5"/><rect x="4.5" y="4" width="3" height="8" rx="0.5"/><rect x="9" y="1.5" width="3" height="10.5" rx="0.5"/><rect x="13" y="0" width="3" height="12" rx="0.5"/></svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="white"><rect x="0" y="1" width="20" height="10" rx="2" stroke="white" strokeWidth="1" fill="none"/><rect x="2" y="3" width="15" height="6" rx="1" fill="#4ADE80"/><rect x="21" y="4" width="3" height="4" rx="1"/></svg>
        </div>
      </div>
      {/* Screen Content */}
      <div style={{
        height: "calc(100% - 50px)",
        overflow: "hidden",
        position: "relative",
      }}>
        {children}
      </div>
      {/* Home Indicator */}
      <div style={{
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: 134,
        height: 5,
        borderRadius: 100,
        background: "rgba(255,255,255,0.3)",
        zIndex: 100,
      }} />
    </div>
  );
}

// === BOT SCREEN ===
function BotScreen() {
  return (
    <div style={{ height: "100%", background: "#0e1621", display: "flex", flexDirection: "column" }}>
      {/* TG Header */}
      <div style={{
        background: "#17212b",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid #0e1621",
      }}>
        <svg width="24" height="24" fill="#5eaaec" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #C67B3C, #E8A665)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>🍪</div>
        <div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Пряничная школа</div>
          <div style={{ color: "#6d7f8f", fontSize: 12 }}>бот</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <svg width="22" height="22" fill="#5eaaec" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Welcome message */}
        <div style={{
          background: "#182533",
          borderRadius: "4px 18px 18px 18px",
          padding: "10px 14px",
          maxWidth: "85%",
          alignSelf: "flex-start",
        }}>
          <div style={{ color: "#fff", fontSize: 14, lineHeight: 1.5 }}>
            🍪 <span style={{ fontWeight: 600 }}>Добро пожаловать в Пряничную школу!</span>
          </div>
          <div style={{ color: "#aab8c6", fontSize: 13.5, lineHeight: 1.5, marginTop: 6 }}>
            Я — AI-помощник для создания уникальных дизайнов пряников.
          </div>
          <div style={{ color: "#aab8c6", fontSize: 13.5, lineHeight: 1.5, marginTop: 8 }}>
            ✨ <span style={{ fontWeight: 500 }}>Что я умею:</span>
          </div>
          <div style={{ color: "#aab8c6", fontSize: 13.5, lineHeight: 1.6, marginTop: 4 }}>
            🎨 Генерировать дизайны по описанию{"\n"}
            📚 Показывать готовые идеи{"\n"}
            💳 Управлять подпиской{"\n"}
            🤝 Реферальная программа — 15%
          </div>
          <div style={{ color: "#6d7f8f", fontSize: 11, textAlign: "right", marginTop: 6 }}>14:32</div>
        </div>

        {/* Second message with image */}
        <div style={{
          background: "#182533",
          borderRadius: "4px 18px 18px 18px",
          overflow: "hidden",
          maxWidth: "85%",
          alignSelf: "flex-start",
        }}>
          <div style={{
            width: "100%",
            height: 160,
            background: "linear-gradient(135deg, #FDF5E6 0%, #F5DEB3 50%, #C67B3C 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            <div style={{ fontSize: 60 }}>🍪</div>
            <div style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              background: "rgba(0,0,0,0.5)",
              borderRadius: 8,
              padding: "3px 8px",
              color: "#fff",
              fontSize: 11,
              fontWeight: 500,
            }}>AI-генератор дизайнов</div>
          </div>
          <div style={{ padding: "10px 14px" }}>
            <div style={{ color: "#fff", fontSize: 14, lineHeight: 1.5 }}>
              ✨ Создайте свой первый дизайн! Откройте приложение и опишите пряник вашей мечты.
            </div>
            <div style={{ color: "#6d7f8f", fontSize: 11, textAlign: "right", marginTop: 6 }}>14:32</div>
          </div>
        </div>

        {/* Info post */}
        <div style={{
          background: "#182533",
          borderRadius: "4px 18px 18px 18px",
          padding: "10px 14px",
          maxWidth: "85%",
          alignSelf: "flex-start",
        }}>
          <div style={{ color: "#fff", fontSize: 14, lineHeight: 1.5 }}>
            📊 <span style={{ fontWeight: 600 }}>Ваш баланс:</span>
          </div>
          <div style={{ color: "#aab8c6", fontSize: 13.5, lineHeight: 1.5, marginTop: 4 }}>
            Тариф: <span style={{ color: "#4ADE80" }}>Базовый</span>{"\n"}
            Генераций: <span style={{ color: "#fff", fontWeight: 600 }}>73 из 100</span>{"\n"}
            Действует до: 28.03.2026
          </div>
          <div style={{ color: "#6d7f8f", fontSize: 11, textAlign: "right", marginTop: 6 }}>14:33</div>
        </div>
      </div>

      {/* Blue WebApp Button */}
      <div style={{ padding: "8px 16px 28px" }}>
        <button style={{
          width: "100%",
          background: "#2B89D6",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "14px 0",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: "0 4px 16px rgba(43,137,214,0.3)",
        }}>
          <span style={{ fontSize: 18 }}>🎨</span>
          Открыть приложение
        </button>
      </div>
    </div>
  );
}

// === HOME SCREEN ===
function HomeScreen() {
  return (
    <div style={{ height: "100%", background: "#FDF5E6", display: "flex", flexDirection: "column" }}>
      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 48, marginBottom: 2 }}>🍪</div>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            background: "linear-gradient(135deg, #C67B3C, #8B4513)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -0.5,
          }}>Пряничная школа</div>
        </div>

        {/* Greeting */}
        <div style={{ fontSize: 17, color: "#5D4037", fontWeight: 500, marginBottom: 16, textAlign: "center" }}>
          Привет, Анна! 👋
        </div>

        {/* Balance Card */}
        <div style={{
          background: "linear-gradient(135deg, #C67B3C 0%, #E8A665 100%)",
          borderRadius: 16,
          padding: "18px 20px",
          marginBottom: 16,
          color: "#fff",
          boxShadow: "0 8px 24px rgba(198,123,60,0.3)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.9 }}>Баланс генераций</span>
            <span style={{ fontSize: 13, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20 }}>
              Базовый
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>73 <span style={{ fontSize: 16, fontWeight: 400, opacity: 0.8 }}>из 100</span></div>
          <div style={{
            height: 6,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 100,
            overflow: "hidden",
          }}>
            <div style={{
              width: "73%",
              height: "100%",
              background: "#fff",
              borderRadius: 100,
            }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Действует до 28 марта 2026</div>
        </div>

        {/* CTA Button */}
        <button style={{
          width: "100%",
          background: "linear-gradient(135deg, #C67B3C 0%, #D4915A 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "16px 0",
          fontSize: 17,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(198,123,60,0.35)",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          🎨 Создать дизайн
        </button>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "🖼", label: "Галерея", count: "12" },
            { icon: "📚", label: "Библиотека", count: "30" },
            { icon: "🤝", label: "Рефералы", count: "3" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 14,
              padding: "14px 8px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 12, color: "#5D4037", fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "#A1887F", marginTop: 2 }}>{item.count}</div>
            </div>
          ))}
        </div>

        {/* Subscription Warning */}
        <div style={{
          background: "#FFF3CD",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "1px solid #FFE08A",
        }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#856404" }}>Подписка заканчивается</div>
            <div style={{ fontSize: 12, color: "#856404", opacity: 0.8 }}>Осталось 3 дня · Продлить →</div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav active="home" />
    </div>
  );
}

function BottomNav({ active }) {
  const items = [
    { id: "home", icon: "🏠", label: "Главная" },
    { id: "gallery", icon: "🖼", label: "Галерея" },
    { id: "sub", icon: "💳", label: "Подписка" },
    { id: "profile", icon: "👤", label: "Профиль" },
  ];
  return (
    <div style={{
      background: "#fff",
      borderTop: "1px solid #F0E0C9",
      display: "flex",
      padding: "6px 0 20px",
      boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
    }}>
      {items.map(item => (
        <div key={item.id} style={{
          flex: 1,
          textAlign: "center",
          cursor: "pointer",
          padding: "6px 0",
        }}>
          <div style={{ fontSize: 20, opacity: active === item.id ? 1 : 0.4 }}>{item.icon}</div>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: active === item.id ? "#C67B3C" : "#A1887F",
            marginTop: 2,
          }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// === CREATE SCREEN ===
function CreateScreen() {
  return (
    <div style={{ height: "100%", background: "#FDF5E6", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid #F0E0C9",
      }}>
        <svg width="24" height="24" fill="#5D4037" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#5D4037" }}>Создать дизайн</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* AI Assistant Hint */}
        <div style={{
          background: "linear-gradient(135deg, #E8F0FE, #D4E4FC)",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a56db" }}>AI-помощник</div>
            <div style={{ fontSize: 12, color: "#3b6ecc", lineHeight: 1.5 }}>
              Опишите пряник на русском языке — я автоматически создам профессиональный промпт для генерации
            </div>
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div style={{
            flex: 1,
            background: "#C67B3C",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 0",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}>💬 Текст</div>
          <div style={{
            flex: 1,
            background: "#fff",
            color: "#8D6E63",
            borderRadius: 10,
            padding: "10px 0",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid #E0D0BD",
          }}>📚 Библиотека</div>
        </div>

        {/* Textarea */}
        <div style={{
          background: "#fff",
          borderRadius: 14,
          border: "2px solid #E0D0BD",
          padding: "14px",
          marginBottom: 14,
          minHeight: 100,
        }}>
          <div style={{ color: "#C67B3C", fontSize: 14, lineHeight: 1.6 }}>
            Пряник в виде ёлочной игрушки, красная и золотая глазурь, блёстки, надпись "С Новым Годом"
          </div>
        </div>

        {/* AI Suggestions */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8D6E63", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <span>✨</span> AI-подсказки
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["🎄 Новогодний", "❤️ С сердцем", "🦋 Бабочка", "🌸 Весенний", "👶 Детский"].map((tag, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid #E0D0BD",
                borderRadius: 20,
                padding: "6px 12px",
                fontSize: 12,
                color: "#5D4037",
                cursor: "pointer",
              }}>{tag}</div>
            ))}
          </div>
        </div>

        {/* Style Selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8D6E63", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <span>🎨</span> Стиль генерации
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { name: "Фотореализм", icon: "📷", active: true },
              { name: "Иллюстрация", icon: "🖌" },
              { name: "Акварель", icon: "💧" },
              { name: "Контур", icon: "✏️" },
            ].map((s, i) => (
              <div key={i} style={{
                background: s.active ? "linear-gradient(135deg, #C67B3C, #E8A665)" : "#fff",
                color: s.active ? "#fff" : "#5D4037",
                borderRadius: 12,
                padding: "12px",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: s.active ? "none" : "1px solid #E0D0BD",
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                {s.name}
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div style={{
          background: "#fff",
          borderRadius: 14,
          padding: "14px",
          marginBottom: 16,
          border: "1px solid #F0E0C9",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8D6E63", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <span>⚙️</span> Настройки
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: "#5D4037" }}>Качество</span>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{
                background: "#E8A665",
                color: "#fff",
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 8,
                fontWeight: 600,
              }}>Standard</span>
              <span style={{
                background: "#F0E0C9",
                color: "#8D6E63",
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 8,
              }}>Developer</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#5D4037" }}>Формат</span>
            <span style={{ fontSize: 13, color: "#8D6E63" }}>1024×1024</span>
          </div>
        </div>
      </div>

      {/* Telegram MainButton */}
      <div style={{
        background: "#C67B3C",
        color: "#fff",
        textAlign: "center",
        padding: "16px 0 32px",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
      }}>
        ✨ Создать дизайн — 1 генерация
      </div>
    </div>
  );
}

// === GENERATING SCREEN ===
function GeneratingScreen() {
  return (
    <div style={{ height: "100%", background: "#FDF5E6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "0 40px" }}>
        {/* Animated cookie */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: 20,
          background: "linear-gradient(135deg, #F5DEB3, #DEB887)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          animation: "pulse 1.5s ease-in-out infinite",
          boxShadow: "0 8px 32px rgba(198,123,60,0.2)",
        }}>
          <span style={{ fontSize: 56 }}>🍪</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#5D4037", marginBottom: 8 }}>
          Создаём дизайн...
        </div>
        <div style={{ fontSize: 13, color: "#A1887F", lineHeight: 1.5, marginBottom: 24 }}>
          AI формирует промпт и генерирует изображение. Обычно это занимает 10-20 секунд
        </div>
        {/* Progress */}
        <div style={{
          height: 4,
          background: "#F0E0C9",
          borderRadius: 100,
          width: "80%",
          margin: "0 auto",
          overflow: "hidden",
        }}>
          <div style={{
            width: "65%",
            height: "100%",
            background: "linear-gradient(90deg, #C67B3C, #E8A665)",
            borderRadius: 100,
            animation: "loading 2s ease-in-out infinite",
          }} />
        </div>
        <div style={{ fontSize: 12, color: "#C67B3C", marginTop: 12, fontWeight: 500 }}>
          🤖 Формирование промпта...
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes loading { 0%{width:20%} 50%{width:80%} 100%{width:65%} }
      `}</style>
    </div>
  );
}

// === RESULT SCREEN ===
function ResultScreen() {
  return (
    <div style={{ height: "100%", background: "#FDF5E6", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid #F0E0C9",
      }}>
        <svg width="24" height="24" fill="#5D4037" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#5D4037" }}>Результат</span>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#A1887F" }}>72/100</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* Generated Image */}
        <div style={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: 16,
          background: "linear-gradient(135deg, #F5DEB3 0%, #DEB887 30%, #C67B3C 60%, #8B4513 100%)",
          marginBottom: 14,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(198,123,60,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Simulated gingerbread image */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 80, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>🎄</div>
            <div style={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: 8,
              padding: "4px 12px",
              marginTop: 8,
              fontSize: 14,
              fontWeight: 700,
              color: "#C41E3A",
              letterSpacing: 0.5,
            }}>С Новым Годом!</div>
          </div>
          {/* Confetti */}
          <div style={{
            position: "absolute",
            top: 10,
            right: 14,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 8,
            padding: "4px 8px",
            color: "#fff",
            fontSize: 11,
          }}>✨ Готово!</div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { icon: "💾", label: "Скачать" },
            { icon: "📤", label: "Поделиться" },
            { icon: "🔄", label: "Ещё раз" },
            { icon: "✏️", label: "Промпт" },
          ].map((a, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 12,
              padding: "12px 4px",
              textAlign: "center",
              cursor: "pointer",
              border: "1px solid #F0E0C9",
            }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{a.icon}</div>
              <div style={{ fontSize: 10, color: "#8D6E63", fontWeight: 500 }}>{a.label}</div>
            </div>
          ))}
        </div>

        {/* Prompt Display */}
        <div style={{
          background: "#fff",
          borderRadius: 14,
          padding: "14px",
          border: "1px solid #F0E0C9",
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{
              background: "#C67B3C",
              color: "#fff",
              fontSize: 11,
              padding: "4px 12px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}>RU Оригинал</div>
            <div style={{
              background: "#F0E0C9",
              color: "#8D6E63",
              fontSize: 11,
              padding: "4px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}>EN Промпт</div>
          </div>
          <div style={{ fontSize: 13, color: "#5D4037", lineHeight: 1.6 }}>
            Пряник в виде ёлочной игрушки, красная и золотая глазурь, блёстки, надпись "С Новым Годом"
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

// === LIBRARY SCREEN ===
function LibraryScreen() {
  const categories = ["🎄 Праздничные", "👶 Детские", "💒 Свадебные", "🌸 Сезонные", "✏️ Контуры"];
  const prompts = [
    { title: "Ёлка с глазурью", cat: "🎄" },
    { title: "Снежинка", cat: "❄️" },
    { title: "Пасхальное яйцо", cat: "🥚" },
    { title: "Тыква Хэллоуин", cat: "🎃" },
    { title: "Сердце Love", cat: "❤️" },
    { title: "Колокольчики", cat: "🔔" },
  ];
  return (
    <div style={{ height: "100%", background: "#FDF5E6", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid #F0E0C9",
      }}>
        <svg width="24" height="24" fill="#5D4037" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#5D4037" }}>📚 Библиотека</span>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: "flex",
        gap: 6,
        padding: "12px 16px",
        overflowX: "auto",
      }}>
        {categories.map((c, i) => (
          <div key={i} style={{
            background: i === 0 ? "#C67B3C" : "#fff",
            color: i === 0 ? "#fff" : "#8D6E63",
            borderRadius: 20,
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
            border: i === 0 ? "none" : "1px solid #E0D0BD",
          }}>{c}</div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {prompts.map((p, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 14,
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <div style={{
                height: 110,
                background: `linear-gradient(${135 + i * 30}deg, #F5DEB3, #DEB887, #C67B3C)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: 40 }}>{p.cat}</span>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#5D4037" }}>{p.title}</div>
                <div style={{ fontSize: 11, color: "#C67B3C", marginTop: 4, fontWeight: 500 }}>Использовать →</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

// === GALLERY SCREEN ===
function GalleryScreen() {
  const items = ["🎄", "❤️", "🦋", "🎃", "⭐", "🌸", "👶", "🔔", "🎀", "🌙", "🦌", "🍪"];
  return (
    <div style={{ height: "100%", background: "#FDF5E6", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #F0E0C9",
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#5D4037" }}>🖼 Галерея</span>
        <div style={{ fontSize: 12, color: "#A1887F" }}>12 дизайнов</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {items.map((emoji, i) => (
            <div key={i} style={{
              aspectRatio: "1",
              borderRadius: 12,
              background: `linear-gradient(${120 + i * 25}deg, #F5DEB3, #DEB887, #C67B3C)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}>
              <span style={{ fontSize: 40 }}>{emoji}</span>
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
                padding: "16px 8px 6px",
                color: "#fff",
                fontSize: 10,
                textAlign: "right",
              }}>
                {`${10 + i}.03.2026`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="gallery" />
    </div>
  );
}

// === SUBSCRIPTION SCREEN ===
function SubscriptionScreen() {
  return (
    <div style={{ height: "100%", background: "#FDF5E6", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #F0E0C9",
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#5D4037" }}>💳 Подписка</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* Current status */}
        <div style={{
          background: "linear-gradient(135deg, #C67B3C, #E8A665)",
          borderRadius: 14,
          padding: "16px",
          color: "#fff",
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Текущий тариф</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Базовый</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>100 генераций/мес · до 28.03.2026</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Автопродление: ✅ Вкл</div>
        </div>

        {/* Plan toggle */}
        <div style={{
          display: "flex",
          background: "#F0E0C9",
          borderRadius: 10,
          padding: 3,
          marginBottom: 14,
        }}>
          <div style={{
            flex: 1,
            background: "#C67B3C",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 0",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
          }}>Базовый</div>
          <div style={{
            flex: 1,
            color: "#8D6E63",
            borderRadius: 8,
            padding: "8px 0",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
          }}>Про</div>
        </div>

        {/* Pricing Cards */}
        {[
          { period: "1 мес", price: "990 ₽", badge: null },
          { period: "3 мес", price: "2 490 ₽", badge: "-16%" },
          { period: "6 мес", price: "4 490 ₽", badge: "-24%", popular: true },
          { period: "12 мес", price: "7 990 ₽", badge: "-33%" },
        ].map((plan, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            border: plan.popular ? "2px solid #C67B3C" : "1px solid #F0E0C9",
            position: "relative",
          }}>
            {plan.popular && (
              <div style={{
                position: "absolute",
                top: -8,
                right: 12,
                background: "#C67B3C",
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
              }}>ПОПУЛЯРНЫЙ</div>
            )}
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#5D4037" }}>{plan.period}</div>
              <div style={{ fontSize: 12, color: "#A1887F" }}>100 генераций/мес</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {plan.badge && (
                <span style={{
                  background: "#E8F5E9",
                  color: "#2E7D32",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 6px",
                  borderRadius: 6,
                }}>{plan.badge}</span>
              )}
              <span style={{ fontSize: 16, fontWeight: 800, color: "#C67B3C" }}>{plan.price}</span>
            </div>
          </div>
        ))}

        <button style={{
          width: "100%",
          background: "linear-gradient(135deg, #C67B3C, #D4915A)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "14px 0",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          marginTop: 8,
        }}>
          Оформить подписку
        </button>
      </div>

      <BottomNav active="sub" />
    </div>
  );
}

// === PROFILE SCREEN ===
function ProfileScreen() {
  return (
    <div style={{ height: "100%", background: "#FDF5E6", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #F0E0C9",
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#5D4037" }}>👤 Профиль</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* Avatar */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C67B3C, #E8A665)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 10px",
            fontSize: 30,
            color: "#fff",
            fontWeight: 800,
          }}>А</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#5D4037" }}>Анна Петрова</div>
          <div style={{ fontSize: 13, color: "#A1887F" }}>@anna_cookies</div>
        </div>

        {/* Menu Items */}
        {[
          { icon: "💳", label: "Подписка", value: "Базовый · до 28.03" },
          { icon: "🔄", label: "Автопродление", value: "Включено", toggle: true },
          { icon: "💳", label: "Привязанная карта", value: "•••• 4242" },
          { icon: "🤝", label: "Рефералы", value: "3 человека" },
          { icon: "📊", label: "Статистика", value: "127 дизайнов" },
          { icon: "📄", label: "Оферта", value: "" },
          { icon: "🔒", label: "Конфиденциальность", value: "" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 0",
            borderBottom: "1px solid #F0E0C9",
            cursor: "pointer",
          }}>
            <span style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: "#5D4037", fontWeight: 500, flex: 1 }}>{item.label}</span>
            {item.toggle ? (
              <div style={{
                width: 42,
                height: 24,
                borderRadius: 12,
                background: "#4ADE80",
                position: "relative",
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 2,
                  right: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
            ) : (
              <span style={{ fontSize: 13, color: "#A1887F" }}>{item.value}</span>
            )}
            {!item.toggle && <svg width="16" height="16" fill="#A1887F" viewBox="0 0 24 24" style={{ marginLeft: 4 }}><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>}
          </div>
        ))}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

// === MAIN APP ===
export default function App() {
  const [activeScreen, setActiveScreen] = useState(0);

  const renderScreen = () => {
    switch (screens[activeScreen]) {
      case "bot": return <BotScreen />;
      case "home": return <HomeScreen />;
      case "create": return <CreateScreen />;
      case "generating": return <GeneratingScreen />;
      case "result": return <ResultScreen />;
      case "library": return <LibraryScreen />;
      case "gallery": return <GalleryScreen />;
      case "subscription": return <SubscriptionScreen />;
      case "profile": return <ProfileScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "32px 16px",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: -0.5,
          marginBottom: 4,
        }}>
          🍪 Пряничная школа
        </div>
        <div style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
        }}>
          Telegram Mini App — Прототип UI
        </div>
      </div>

      {/* Screen Selector */}
      <div style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: 28,
        maxWidth: 600,
      }}>
        {screens.map((s, i) => (
          <button
            key={s}
            onClick={() => setActiveScreen(i)}
            style={{
              background: activeScreen === i
                ? "linear-gradient(135deg, #C67B3C, #E8A665)"
                : "rgba(255,255,255,0.08)",
              color: activeScreen === i ? "#fff" : "rgba(255,255,255,0.6)",
              border: activeScreen === i ? "none" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {screenNames[s]}
          </button>
        ))}
      </div>

      {/* iPhone Preview */}
      <IPhoneFrame title={screenNames[screens[activeScreen]]}>
        {renderScreen()}
      </IPhoneFrame>

      {/* Navigation Arrows */}
      <div style={{
        display: "flex",
        gap: 16,
        marginTop: 24,
        alignItems: "center",
      }}>
        <button
          onClick={() => setActiveScreen(Math.max(0, activeScreen - 1))}
          disabled={activeScreen === 0}
          style={{
            background: activeScreen === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            color: activeScreen === 0 ? "rgba(255,255,255,0.2)" : "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: activeScreen === 0 ? "default" : "pointer",
          }}
        >
          ← Назад
        </button>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          {activeScreen + 1} / {screens.length}
        </span>
        <button
          onClick={() => setActiveScreen(Math.min(screens.length - 1, activeScreen + 1))}
          disabled={activeScreen === screens.length - 1}
          style={{
            background: activeScreen === screens.length - 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            color: activeScreen === screens.length - 1 ? "rgba(255,255,255,0.2)" : "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: activeScreen === screens.length - 1 ? "default" : "pointer",
          }}
        >
          Далее →
        </button>
      </div>

      {/* Flow description */}
      <div style={{
        marginTop: 24,
        background: "rgba(255,255,255,0.05)",
        borderRadius: 14,
        padding: "16px 20px",
        maxWidth: 500,
        width: "100%",
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
          📱 Пользовательский путь:
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
          Бот → Синяя кнопка «Открыть приложение» → Главная → Создать дизайн → AI обрабатывает → Результат → Сохранить/Поделиться
        </div>
      </div>
    </div>
  );
}
