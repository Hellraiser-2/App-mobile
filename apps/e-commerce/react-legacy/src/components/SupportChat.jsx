import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Phone, ArrowRight } from "lucide-react";

const WA_PHONE = "56900000000";
const WA_DEFAULT_MSG = "Hola Roxy, necesito ayuda con un pedido 🎸";

const initialMessages = [
  {
    from: "bot",
    text: "¡Hola! Soy *Roxy*, tu asistente de Rockstar 🚀 ¿En qué te puedo ayudar hoy?",
  },
  {
    from: "bot",
    text: "Puedo ayudarte con:\n1. 📦 Rastreo de pedidos\n2. 🔄 Cambios y devoluciones\n3. 💳 Métodos de pago\n4. 👕 Consultas de productos",
  },
];

const quickReplies = [
  "Rastrear mi pedido",
  "Quiero hacer una devolución",
  "Hablar con un agente",
];

const botResponses = {
  "rastrear mi pedido":
    "Para rastrear tu pedido necesito tu *Número de Orden* y el *Correo* asociado. ¿Me los compartes? 📦",
  "quiero hacer una devolución":
    "Tienes hasta *30 días* después de tu compra para solicitar un cambio 🙌. Cuéntame el *motivo* y el *número de orden* para ayudarte.",
  "hablar con un agente":
    "Te derivo con un asesor del equipo Rockstar 🎸. Confírmame tu *nombre completo*, *número de orden* (si aplica) y el motivo de la consulta.",
  default:
    "Anotado ✅. Si me das más detalle (orden, email o producto) te ayudo al tiro.",
};

function buildWhatsAppUrl(text) {
  const encoded = encodeURIComponent(text || WA_DEFAULT_MSG);
  return `https://wa.me/${WA_PHONE}?text=${encoded}`;
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setMessages((m) => [...m, { from: "user", text: value }]);
    setInput("");
    const lower = value.toLowerCase();
    const response =
      Object.entries(botResponses).find(([k]) => lower.includes(k) && k !== "default")?.[1] ||
      botResponses.default;
    window.setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: response }]);
    }, 600);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-lg font-black">
              R
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">Roxy · Soporte Rockstar</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
                En línea
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex max-h-96 min-h-72 flex-col gap-2 overflow-y-auto bg-[#0b141a] p-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    m.from === "user"
                      ? "rounded-br-sm bg-emerald-600 text-white"
                      : "rounded-bl-sm bg-zinc-800 text-zinc-100"
                  }`}
                >
                  {m.text
                    .split(/(\*[^*]+\*)/g)
                    .map((part, idx) =>
                      part.startsWith("*") && part.endsWith("*") ? (
                        <strong key={idx}>{part.slice(1, -1)}</strong>
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-zinc-900 bg-zinc-950 px-3 py-2 overflow-x-auto">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="whitespace-nowrap rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[11px] font-semibold text-zinc-300 hover:border-emerald-700 hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 border-t border-zinc-900 bg-zinc-950 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Escribe tu mensaje..."
              className="flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-600"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:opacity-40"
              aria-label="Enviar"
            >
              <Send size={16} />
            </button>
          </div>

          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-t border-zinc-900 bg-zinc-950 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-zinc-900 hover:text-emerald-300"
          >
            <Phone size={14} />
            Continuar en WhatsApp
            <ArrowRight size={14} />
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-900/50 transition hover:scale-105 hover:bg-emerald-400"
        aria-label="Abrir chat de soporte"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
        {!open && (
          <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black">
            1
          </span>
        )}
      </button>
    </>
  );
}
