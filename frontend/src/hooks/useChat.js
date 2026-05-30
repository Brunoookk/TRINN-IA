import { useState, useEffect, useRef, useCallback } from 'react';
import { createSession, streamChat, uploadPDF, clearHistory } from '../utils/api';

export function useChat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    createSession().then(({ session_id }) => setSessionId(session_id));
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !sessionId || isLoading) return;
    const uid = Date.now();
    setMessages(prev => [...prev, { role: 'user', content: text, id: uid }]);
    setIsLoading(true);
    const aid = uid + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: aid }]);
    try {
      await streamChat(sessionId, text,
        (token) => setMessages(prev => prev.map(m => m.id === aid ? { ...m, content: m.content + token } : m)),
        () => setIsLoading(false),
        (err) => { setMessages(prev => prev.map(m => m.id === aid ? { ...m, content: `❌ ${err}`, error: true } : m)); setIsLoading(false); }
      );
    } catch { setIsLoading(false); }
  }, [sessionId, isLoading]);

  const handlePDFUpload = useCallback(async (file) => {
    if (!sessionId) return null;
    try {
      const info = await uploadPDF(sessionId, file);
      setPdfInfo(info);
      return info;
    } catch (err) { console.error(err); return null; }
  }, [sessionId]);

  const clearChat = useCallback(async () => {
    if (!sessionId) return;
    await clearHistory(sessionId);
    setMessages([]); setPdfInfo(null);
  }, [sessionId]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Navegador não suporta voz.'); return; }
    const r = new SR(); r.lang = 'pt-BR';
    r.onstart = () => setIsListening(true);
    r.onend = () => setIsListening(false);
    r.onresult = (e) => sendMessage(e.results[0][0].transcript);
    r.onerror = () => setIsListening(false);
    recognitionRef.current = r; r.start();
  }, [sendMessage]);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);

  const speakMessage = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stopSpeaking = useCallback(() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }, []);

  return { messages, isLoading, pdfInfo, isListening, isSpeaking, sessionId, sendMessage, handlePDFUpload, clearChat, startListening, stopListening, speakMessage, stopSpeaking };
}
