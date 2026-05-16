/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { getVal, setVal } from './lib/db';
import { GAMES } from './data/games';
import { 
  Globe, 
  Gamepad2, 
  Settings, 
  Terminal, 
  Music, 
  Maximize2, 
  Minimize2, 
  X, 
  Search,
  Monitor,
  Shield,
  EyeOff,
  Clock,
  Battery,
  Wifi,
  MoreVertical,
  Minus,
  Sparkles,
  Rss,
  MessageCircle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Compass,
  ArrowRight,
  RotateCcw,
  Volume2,
  Filter,
  Box,
  VolumeX,
  History,
  Info,
  LayoutGrid,
  Zap,
  Lock,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Bell,
  Trash,
  Brain,
  Cpu,
  Send,
  RefreshCw,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  Video
} from 'lucide-react';

// --- Constants & Types ---

type AppId = 'browser' | 'games' | 'settings' | 'music' | 'terminal' | 'wallpapers';

interface OpenWindow {
  id: AppId;
  isMinimized: boolean;
  zIndex: number;
  url?: string;
  title?: string;
}

const TOP_SITES = [
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '🔴', color: 'text-red-500' },
  { name: 'Discord', url: 'https://discord.com/app', icon: '👔', color: 'text-indigo-400' },
  { name: 'TikTok', url: 'https://www.tiktok.com', icon: '🎵', color: 'text-white' },
  { name: 'Roblox', url: 'https://www.roblox.com', icon: '🧱', color: 'text-gray-400' },
];

interface AppConfig {
  id: AppId;
  title: string;
  icon: React.ElementType;
  color: string;
}

const APPS: AppConfig[] = [
  { id: 'browser', title: 'Browser', icon: Compass, color: 'text-white' },
  { id: 'games', title: 'Games', icon: Gamepad2, color: 'text-white' },
  { id: 'music', title: 'Monk Music', icon: Music, color: 'text-white' },
  { id: 'wallpapers', title: 'Wallpapers', icon: LayoutGrid, color: 'text-white' },
  { id: 'settings', title: 'Settings', icon: Settings, color: 'text-white' },
  { id: 'terminal', title: 'Monk AI', icon: Terminal, color: 'text-white' },
];

const SIDEBAR_APPS: AppConfig[] = [
  { id: 'browser' as any, title: 'Browser', icon: Compass, color: 'text-white/60' },
  { id: 'wallpapers' as any, title: 'Wallpapers', icon: LayoutGrid, color: 'text-white/60' },
  { id: 'settings' as any, title: 'Settings', icon: Settings, color: 'text-white/60' },
  { id: 'terminal' as any, title: 'Monk AI', icon: Terminal, color: 'text-white/60' },
];

const CLOAK_PRESETS = [
  { name: 'Default', title: 'MonkBin V2', icon: '/favicon.ico' },
  { name: 'Google', title: 'Google', icon: 'https://www.google.com/favicon.ico' },
  { name: 'Classes', title: 'Classes', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
  { name: 'Canvas', title: 'Dashboard', icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
  { name: 'Clever', title: 'Clever | Portal', icon: 'https://clever.com/favicon.ico' },
];

// --- Components ---

function Window({ 
  id, 
  title, 
  icon: Icon, 
  color,
  isActive, 
  onFocus, 
  onClose, 
  onMinimize, 
  zIndex,
  initialX = 40,
  initialY = 60,
  children 
}: any) {
  const controls = useDragControls();

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragListener={false}
      dragControls={controls}
      initial={{ scale: 0.95, opacity: 0, x: initialX, y: initialY + 20 }}
      animate={{ scale: 1, opacity: 1, x: initialX, y: initialY }}
      exit={{ scale: 0.95, opacity: 0, x: initialX, y: initialY + 20 }}
      onPointerDown={(e) => {
        if (!isActive) onFocus();
      }}
      style={{ zIndex }}
      id={`window-${id}`}
      className={`absolute w-[860px] h-[580px] max-w-[95vw] max-h-[85vh] flex flex-col rounded-2xl border overflow-hidden shadow-2xl glass pointer-events-auto ${isActive ? 'border-white/20' : 'border-white/10 opacity-90'}`}
    >
      <div 
        className="h-10 px-3 flex items-center justify-between border-b border-white/5 bg-white/5 select-none shrink-0"
        onPointerDown={(e) => controls.start(e)}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" onPointerDown={e => e.stopPropagation()}>
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors border border-rose-600" />
            <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors border border-amber-600" />
            <button className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors border border-emerald-600" />
          </div>
          <div className="flex items-center gap-2 ml-1">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span className="text-[12px] font-semibold text-white/80 tracking-wide">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-40">
          <Search size={14} className="text-white" />
          <MoreVertical size={14} className="text-white" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto relative bg-black/20 music-scroll">
        {children}
      </div>
    </motion.div>
  );
}

// --- App Modules ---

function BrowserApp({ initialUrl }: { initialUrl?: string }) {
  const [tabs, setTabs] = useState([{ id: '1', title: 'New Tab', url: initialUrl || '' }]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [input, setInput] = useState('');

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);

  const updateTab = useCallback((id: string, updates: Partial<{ url: string, title: string }>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const handleGo = (e?: React.FormEvent, targetUrl?: string) => {
    if (e) e.preventDefault();
    let target = targetUrl || input.trim();
    if (!target) return;
    
    if (target.includes('.') && !target.includes(' ')) {
      if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    } else {
      target = `https://duckduckgo.com/?q=${encodeURIComponent(target)}&kp=-1&kl=wt-wt`;
    }
    
    const finalUrl = (!target.includes('google.com') && !target.includes('duckduckgo.com') && target.startsWith('http')) 
      ? `/api/proxy?url=${encodeURIComponent(target)}` 
      : target;
      
    // Set title based on domain
    let domain = '';
    try { domain = new URL(target).hostname; } catch(e) { domain = target; }
    updateTab(activeTabId, { url: finalUrl, title: domain });
    setInput('');
  };

  const addTab = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setTabs([...tabs, { id, title: 'New Tab', url: '' }]);
    setActiveTabId(id);
    setInput('');
  };

  const removeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      const idx = tabs.findIndex(t => t.id === id);
      const nextTab = newTabs[idx] || newTabs[idx - 1];
      setActiveTabId(nextTab.id);
    }
  };

  const QUICK_LINKS = [
    { name: 'Minecraft Classic', url: 'https://classic.minecraft.net' },
    { name: 'FreezeNova', url: 'https://freezenova.com' },
    { name: 'now.gg', url: 'https://now.gg' },
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'GitHub', url: 'https://github.com' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] text-slate-300">
      {/* Tabs Bar */}
      <div className="h-9 bg-[#070707] flex items-center px-2 gap-1 overflow-x-auto no-scrollbar border-b border-white/5">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => { setActiveTabId(tab.id); setInput(''); }}
            className={`group h-[28px] min-w-[120px] max-w-[180px] flex items-center px-3 rounded-t-lg cursor-pointer transition-all ${activeTabId === tab.id ? 'bg-[#1a1a1c] text-white border-t border-x border-white/10' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <span className="text-[11px] font-medium truncate flex-1">{tab.title}</span>
            <X 
              size={12} 
              className={`hover:text-white transition-opacity ${activeTabId === tab.id ? 'opacity-60' : 'opacity-0 group-hover:opacity-60'}`} 
              onClick={(e) => removeTab(e, tab.id)}
            />
          </div>
        ))}
        <button onClick={addTab} className="p-1.5 hover:bg-white/5 rounded-full text-gray-500 hover:text-white">
          <Plus size={14} />
        </button>
      </div>

      {/* Nav Bar */}
      <div className="h-10 border-b border-white/5 bg-[#1a1a1c] flex items-center px-3 gap-3">
        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500"><SkipBack size={14} /></button>
          <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500"><SkipForward size={14} /></button>
          <button onClick={() => updateTab(activeTabId, { url: activeTab.url })} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500"><RotateCcw size={14} /></button>
        </div>
        <form onSubmit={handleGo} className="flex-1">
          <div className="flex items-center bg-[#070707]/60 border border-white/10 rounded-xl px-3 py-1 focus-within:border-white/20 transition-all">
            <Globe size={12} className="text-gray-600 mr-2" />
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-[12px] w-full placeholder:text-gray-600"
              placeholder="Search or enter URL..."
              onPointerDown={e => e.stopPropagation()}
            />
          </div>
        </form>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">
           Stealth Node Active
        </div>
      </div>

      {/* Scripts/Quick Links Row */}
      <div className="h-9 border-b border-white/5 bg-[#1a1a1c] flex items-center px-3">
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 px-3 py-0.5 h-6 rounded-md bg-indigo-600/90 hover:bg-indigo-600 text-white text-[10px] font-black tracking-widest uppercase border border-indigo-500/30">
             / SCRIPTS
           </button>
           <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {QUICK_LINKS.map(link => (
                <button 
                  key={link.name} 
                  onClick={() => handleGo(undefined, link.url)}
                  className="text-[11px] font-bold text-gray-500 hover:text-white transition-colors whitespace-nowrap"
                >
                  {link.name}
                </button>
              ))}
           </div>
        </div>
      </div>
      
      {/* Viewport */}
      <div className="flex-1 relative bg-white overflow-hidden" onPointerDown={e => e.stopPropagation()}>
        {(!activeTab.url || activeTab.url === '') ? (
          <div className="absolute inset-0 bg-[#0d0d0f] z-10 p-10 flex flex-col items-center justify-center overflow-y-auto music-scroll">
            <div className="flex flex-col items-center mb-12">
               <h2 className="text-[120px] font-black text-white tracking-tighter leading-none select-none drop-shadow-[0_20px_50px_rgba(255,255,255,0.05)]">MonkSurf</h2>
               <p className="text-[11px] text-gray-600 uppercase tracking-[0.4em] font-black font-mono mt-4">Search the Web — Powered by DuckDuckGo</p>
            </div>
            
            <form onSubmit={handleGo} className="w-full max-w-xl group">
              <div className="relative flex items-center">
                <Search className="absolute left-6 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Search with DuckDuckGo or enter a URL"
                  className="w-full h-16 glass rounded-full border border-white/10 px-16 text-lg text-white font-medium focus:border-white/30 outline-none transition-all placeholder:text-gray-600 shadow-2xl"
                  onPointerDown={e => e.stopPropagation()}
                />
                <button 
                  type="submit"
                  className="absolute right-4 px-6 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-sm transition-all flex items-center justify-center border border-white/5"
                >
                  Go
                </button>
              </div>
            </form>

            <div className="mt-16 w-full max-w-2xl text-center">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6">Quick Links</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TOP_SITES.map(site => (
                    <button 
                      key={site.name}
                      onClick={() => handleGo(undefined, site.url)}
                      className="p-4 glass rounded-2xl border border-white/5 hover:border-white/15 transition-all text-left flex items-center gap-3"
                    >
                      <span className="text-xl">{site.icon}</span>
                      <span className="text-[11px] font-bold text-white/60">{site.name}</span>
                    </button>
                  ))}
               </div>
            </div>
          </div>
        ) : null}
        
        {activeTab.url ? (
          <iframe 
            key={activeTab.id + activeTab.url}
            src={activeTab.url} 
            className="w-full h-full border-none" 
            title="Browser" 
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        ) : null}
      </div>
    </div>
  );
}

function GamesApp({ openApp }: { openApp: (id: AppId, url?: string, title?: string) => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [activeGame, setActiveGame] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const categories = [
    { name: `All ${GAMES.length}`, val: 'All' },
    { name: '★', val: 'Favorites' },
    { name: 'FPS 37', val: 'FPS' },
    { name: 'Nexora !', val: 'Nexora' },
    { name: 'Webports 391', val: 'Webports' },
    { name: 'FreezeNova !', val: 'FreezeNova' },
    { name: '3kh0 !', val: '3kh0' },
    { name: 'Selenite 266', val: 'Selenite' },
    { name: 'NettleWeb !', val: 'NettleWeb' },
    { name: 'Slept-MS !', val: 'Slept-MS' },
    { name: 'GFiles !', val: 'GFiles' },
    { name: 'UGS 355', val: 'UGS' },
    { name: 'Soren !', val: 'Soren' },
  ];

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase()) || 
                           game.desc.toLowerCase().includes(search.toLowerCase());
      if (filter === 'All') return matchesSearch;
      return matchesSearch;
    });
  }, [search, filter]);

  if (activeGame) {
    const handleFullscreen = () => {
      const elem = document.getElementById('game-viewport');
      if (elem?.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
          console.error("Fullscreen request failed:", err);
        });
      }
    };

    return (
      <div className="flex flex-col h-full bg-black">
        <div className="h-10 bg-[#0d0d0f] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setActiveGame(null)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
             >
                <ChevronLeft size={18} />
             </button>
             <span className="text-[11px] font-black text-white/40 uppercase tracking-widest truncate max-w-[200px]">{activeGame.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" 
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button 
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" 
              title="Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
        <div id="game-viewport" className="flex-1 overflow-hidden relative bg-[#070707]" onPointerDown={e => e.stopPropagation()}>
          <iframe 
            key={refreshKey}
            src={activeGame.url.replace('raw.githubusercontent.com', 'raw.githack.com').replace('/refs/heads/', '/')} 
            className="w-full h-full border-0 absolute inset-0 pointer-events-auto"
            allow="autoplay; fullscreen; keyboard; pointer-lock"
            title={activeGame.title}
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] text-slate-300 overflow-hidden">
      <div className="shrink-0 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Gamepad2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white tracking-tight">Games</h2>
                <span className="text-[11px] text-gray-500 font-bold mt-1 tabular-nums">{GAMES.length} games · {filteredGames.length} shown</span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/5 hover:border-white/10 text-[11px] font-black text-gray-300 transition-all uppercase tracking-widest">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[#141416] border border-white/5 rounded-2xl text-white placeholder-gray-700/50 focus:outline-none focus:border-white/15 focus:bg-[#18181b] transition-all font-medium text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1 music-scroll overflow-x-auto no-scrollbar max-h-24 overflow-y-auto">
          {categories.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => setFilter(cat.val)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black transition-all border whitespace-nowrap ${
                filter === cat.val 
                ? 'bg-white text-black border-white' 
                : 'bg-[#1a1a1c] border-white/5 text-gray-400 hover:border-white/10'
              }`}
            >
              {cat.name.split(' !')[0]} 
              {cat.name.includes('!') && <span className="ml-1 text-red-500">!</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto music-scroll px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGames.map((game, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveGame(game)}
              className="group relative aspect-[4/3] bg-[#141416] rounded-3xl border border-white/5 hover:border-white/15 transition-all overflow-hidden flex flex-col items-stretch text-left shadow-2xl"
            >
              <div className="absolute top-3 left-3 z-10">
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)] ${
                  ['bg-emerald-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-amber-400'][idx % 5]
                }`} />
              </div>
              
              <div className="relative flex-1 bg-[#1a1a1c] overflow-hidden">
                {game.image ? (
                  <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Box size={44} className="opacity-10 translate-y-2" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="px-4 py-3 bg-[#111113] shrink-0 border-t border-white/5">
                <h3 className="text-xs font-black text-white/70 truncate group-hover:text-white transition-colors tracking-tight">{game.title}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsApp({ cloak, setCloak, setTheme, theme, performance, setPerformance, animations, setAnimations }: any) {
  const launchAboutBlank = () => {
    const win = window.open('about:blank', '_blank');
    if (win) {
      const iframe = win.document.createElement('iframe');
      iframe.src = window.location.href;
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      win.document.body.appendChild(iframe);
      win.document.body.style.margin = '0';
      win.document.body.style.padding = '0';
      win.document.title = 'Google Docs'; 
      window.location.replace('https://www.google.com'); 
    } else {
      alert('Pop-up blocked! Please allow pop-ups to use Stealth Mode.');
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Security & Stealth</h3>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">Active</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
           <button 
             onClick={launchAboutBlank}
             className="p-4 glass rounded-2xl border border-white/5 hover:border-indigo-500/30 group transition-all flex items-center justify-between"
           >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <ExternalLink size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Launch in about:blank</p>
                  <p className="text-[10px] text-gray-500">Opens the app in a hidden window and redirects this tab.</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
           </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Tab Cloaking</h3>
        <div className="grid grid-cols-2 gap-2">
          {CLOAK_PRESETS.map(p => (
            <button key={p.name} onClick={() => setCloak(p)} className={`p-4 glass rounded-2xl border transition-all flex items-center gap-3 ${cloak.name === p.name ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 hover:border-white/15'}`}>
              {p.icon && <img src={p.icon} className="w-6 h-6 rounded" alt="" />}
              <span className="text-[12px] font-medium text-white">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Performance & UI</h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setAnimations(!animations)}
            className={`p-4 glass rounded-2xl border transition-all flex items-center justify-between ${animations ? 'border-white/20 bg-white/5' : 'border-white/5 opacity-60'}`}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={16} className={animations ? 'text-emerald-400' : 'text-gray-500'} />
              <span className="text-[12px] font-medium text-white">Animations</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${animations ? 'bg-emerald-500' : 'bg-gray-600'}`}>
               <div className={`w-3 h-3 bg-white rounded-full transition-transform ${animations ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
          
          <button 
            onClick={() => setPerformance(!performance)}
            className={`p-4 glass rounded-2xl border transition-all flex items-center justify-between ${performance ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <Zap size={16} className={performance ? 'text-amber-400' : 'text-gray-500'} />
              <span className="text-[12px] font-medium text-white">Performance Mode</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${performance ? 'bg-amber-500' : 'bg-gray-600'}`}>
               <div className={`w-3 h-3 bg-white rounded-full transition-transform ${performance ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

function MonkAIApp() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [showModelSelector, setShowModelSelector] = useState(false);

  const MODELS = [
    { id: 'gemini-3-flash-preview', name: 'Monk Flash 3.0', desc: 'Speed & Efficiency', icon: Zap, color: 'text-emerald-400' },
    { id: 'gemini-3.1-pro-preview', name: 'Monk Pro 3.1', desc: 'Complex Problem Solving', icon: Shield, color: 'text-indigo-400' },
    { id: 'gemini-2.0-flash-thinking-exp-1219', name: 'Monk Thinking', desc: 'Deep Reasoning Mode', icon: Brain, color: 'text-amber-400' },
    { id: 'gemini-3.1-flash-lite', name: 'Monk Lite', desc: 'Lightweight & Stable', icon: Cpu, color: 'text-slate-400' },
  ];

  const activeModel = MODELS.find(m => m.id === model) || MODELS[0];

  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input, 
          model: model,
          history: messages.slice(-6)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err: any) {
      let errorMsg = `Error: ${err.message}`;
      if (err.message.includes('403') || err.message.includes('400') || err.message.toLowerCase().includes('api_key')) {
        errorMsg += ". Please check your API key in the Settings > Secrets panel.";
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#070707] text-slate-200">
      <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between bg-black/40 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${activeModel.color}`}>
            <activeModel.icon size={18} />
          </div>
          <div className="flex flex-col">
            <button 
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-1.5 text-[13px] font-black text-white hover:opacity-80 transition-all"
            >
              {activeModel.name} <ChevronRight size={12} className={`transition-transform ${showModelSelector ? 'rotate-90' : ''}`} />
            </button>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Neural Engine Active</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button onClick={() => setMessages([])} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-rose-400 transition-colors">
             <Trash2 size={16} />
           </button>
        </div>

        {/* Model Selector Popover */}
        <AnimatePresence>
          {showModelSelector && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-4 w-72 glass-strong rounded-2xl border-white/10 p-2 shadow-2xl z-[100] pointer-events-auto"
            >
              <div className="space-y-1">
                {MODELS.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => { setModel(m.id); setShowModelSelector(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${model === m.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className={`p-2 rounded-lg bg-black/40 ${m.color}`}>
                      <m.icon size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-white leading-none">{m.name}</p>
                      <p className="text-[9px] text-gray-500 mt-1">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 music-scroll">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-2xl animate-pulse">
               <Sparkles size={40} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-white px-8">How can Monk AI help you today?</h2>
            <div className="grid grid-cols-2 gap-2 mt-8 w-full max-w-sm">
               {['Write code', 'Explain math', 'System help', 'Creative text'].map(label => (
                 <button key={label} onClick={() => setInput(label)} className="p-3 glass rounded-xl border-white/5 text-[11px] font-bold text-gray-400 hover:text-white hover:border-white/20 transition-all">
                   {label}
                 </button>
               ))}
            </div>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border border-white/10 ${activeModel.color} bg-white/5`}>
                  <activeModel.icon size={14} />
                </div>
              )}
              <div className={`max-w-[85%] p-4 rounded-3xl text-[13px] leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-indigo-600/90 text-white rounded-tr-none' : 'glass-strong border-white/5 text-slate-200 rounded-tl-none'}`}>
                 {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border border-white/10 bg-indigo-500/20 text-indigo-400">
                  <span className="text-[10px] font-black uppercase">Me</span>
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 ${activeModel.color} bg-white/5`}>
                <activeModel.icon size={14} className="animate-spin" />
              </div>
              <div className="glass-strong border-white/5 p-4 rounded-3xl rounded-tl-none flex gap-1.5 items-center">
                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={lastMessageRef} />
        </div>
      </div>

      <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative group">
            <textarea 
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              onPointerDown={e => e.stopPropagation()}
              placeholder={`Message ${activeModel.name}...`}
              rows={1}
              className="w-full max-h-48 bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-[13px] text-white outline-none focus:border-white/20 transition-all resize-none group-focus-within:bg-white/[0.08]"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-white text-black hover:bg-emerald-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[9px] text-gray-500 text-center mt-3 uppercase tracking-widest font-black">Monk AI can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );
}

function WallpapersApp({ setWallpaper }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setWallpaper(url);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*,video/*,.gif" 
          className="hidden" 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-8 glass rounded-3xl border border-white/5 hover:border-purple-500/30 group transition-all flex flex-col items-center justify-center text-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <div>
            <p className="text-base font-black text-white">Upload Custom Media</p>
            <p className="text-xs text-gray-500 mt-1">Select a Video, GIF, or Image to set as background.</p>
          </div>
        </button>

        <button 
          onClick={() => setWallpaper('')}
          className="p-4 glass rounded-2xl border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-white"
        >
          <Trash size={14} />
          <span className="text-[11px] font-black uppercase tracking-widest">Reset to Default</span>
        </button>
      </div>
    </div>
  );
}

function AppContent({ id, setCloak, setTheme, theme, setWallpaper, cloak, performance, setPerformance, animations, setAnimations, winUrl, openApp }: any) {
  switch (id) {
    case 'browser': return <BrowserApp initialUrl={winUrl} />;
    case 'games': return <GamesApp openApp={openApp} />;
    case 'wallpapers': return <WallpapersApp setWallpaper={setWallpaper} />;
    case 'settings': return (
      <SettingsApp 
        cloak={cloak} 
        setCloak={setCloak} 
        setTheme={setTheme} 
        theme={theme}
        performance={performance}
        setPerformance={setPerformance}
        animations={animations}
        setAnimations={setAnimations}
        setWallpaper={setWallpaper}
      />
    );
    case 'terminal': return <MonkAIApp />;
    default: return (
      <div className="flex flex-col items-center justify-center h-full p-10 opacity-30 text-center">
        <Monitor size={64} className="mb-4" />
        <p className="text-xl font-bold">App Stub</p>
        <p className="text-xs text-gray-500 mt-2">This feature is ready for integration.</p>
      </div>
    );
  }
}

// --- Main OS Component ---

export default function App() {
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<AppId | null>(null);
  const [zIndex, setZIndex] = useState(10);
  
  // Persistence States
  const [cloak, setCloak] = useState(() => {
    try {
      const saved = localStorage.getItem('kp_cloak');
      return saved ? JSON.parse(saved) : CLOAK_PRESETS[0];
    } catch {
      return CLOAK_PRESETS[0];
    }
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('kp_theme') || 'midnight');
  const [wallpaper, setWallpaper] = useState('');
  const [performance, setPerformance] = useState(() => localStorage.getItem('kp_performance') === 'true');
  const [animations, setAnimations] = useState(() => localStorage.getItem('kp_animations') !== 'false');

  const [time, setTime] = useState(new Date());
  const [isPanic, setIsPanic] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('kp_cloak', JSON.stringify(cloak));
    } catch (e) {
      console.error('Failed to save cloak settings:', e);
    }
    document.title = cloak.title;
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link && cloak.icon) link.href = cloak.icon;
  }, [cloak]);

  useEffect(() => {
    try {
      localStorage.setItem('kp_theme', theme);
    } catch (e) {
      console.error('Failed to save theme settings:', e);
    }
  }, [theme]);

  useEffect(() => {
    getVal('kp_wallpaper').then(val => {
      if (val) {
        setWallpaper(val);
      } else {
        // Migration/Cleanup
        const legacy = localStorage.getItem('kp_wallpaper');
        if (legacy) {
          setWallpaper(legacy);
          localStorage.removeItem('kp_wallpaper');
        }
      }
    }).catch(err => {
      console.error('Failed to load wallpaper from DB:', err);
    });
  }, []);

  useEffect(() => {
    if (wallpaper) {
      setVal('kp_wallpaper', wallpaper).catch(e => {
        console.error('Failed to save wallpaper to DB:', e);
      });
    } else {
      // If wallpaper is empty string (reset), we can also remove it
      setVal('kp_wallpaper', '').catch(() => {});
    }
  }, [wallpaper]);

  useEffect(() => {
    try {
      localStorage.setItem('kp_performance', performance.toString());
    } catch (e) {
      console.error('Failed to save performance settings:', e);
    }
  }, [performance]);

  useEffect(() => {
    try {
      localStorage.setItem('kp_animations', animations.toString());
    } catch (e) {
      console.error('Failed to save animations settings:', e);
    }
  }, [animations]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
        setIsPanic(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openApp = useCallback((id: AppId, url?: string) => {
    setOpenWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) return prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: zIndex + 1, url: url || w.url } : w);
      return [...prev, { id, isMinimized: false, zIndex: zIndex + 1, url }];
    });
    setZIndex(prev => prev + 1);
    setActiveWindow(id);
  }, [zIndex]);

  const closeApp = useCallback((id: AppId) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindow === id) setActiveWindow(null);
  }, [activeWindow]);

  const minimizeApp = useCallback((id: AppId) => {
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindow(null);
  }, []);

  const focusApp = useCallback((id: AppId) => {
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndex + 1 } : w));
    setZIndex(prev => prev + 1);
    setActiveWindow(id);
  }, [zIndex]);

  if (isPanic) {
    return (
      <div className="fixed inset-0 z-[10000] bg-white flex flex-col font-sans">
        <div className="h-14 border-b border-gray-200 flex items-center px-6 gap-8 text-[14px]">
          <div className="flex items-center gap-2 text-gray-600 font-medium">
             <img src="https://ssl.gstatic.com/classroom/favicon.png" className="w-6 h-6" alt="" />
             <span>Google Classroom</span>
          </div>
          <div className="flex items-center gap-6 text-gray-500 font-medium ml-4">
             <span className="text-emerald-700 border-b-2 border-emerald-700 pb-4 h-14 flex items-center mt-4">Stream</span>
             <span>Classwork</span>
             <span>People</span>
             <span>Grades</span>
          </div>
        </div>
        <div className="flex-1 p-8 bg-gray-50">
           <div className="max-w-4xl mx-auto space-y-6">
              <div className="h-48 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex items-end">
                 <h1 className="text-3xl font-bold text-white">Advanced Geometry - Period 4</h1>
              </div>
              <div className="flex gap-6">
                 <div className="w-48 space-y-4">
                    <div className="p-4 rounded-lg border border-gray-200 bg-white">
                       <p className="text-xs font-bold text-gray-700">Upcoming</p>
                       <p className="text-xs text-gray-500 mt-2">Woohoo, no work due soon!</p>
                       <button className="text-xs text-emerald-700 font-bold mt-4 hover:underline">View All</button>
                    </div>
                 </div>
                 <div className="flex-1 space-y-4">
                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200" />
                       <p className="text-sm text-gray-400">Announce something to your class</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505] font-sans text-slate-200">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {wallpaper && (
          wallpaper.startsWith('data:video') || wallpaper.endsWith('.mp4') || wallpaper.endsWith('.webm') ? (
            <video 
              src={wallpaper} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover transition-opacity duration-1000 opacity-40" 
            />
          ) : (
            <img src={wallpaper} className="w-full h-full object-cover transition-opacity duration-1000 opacity-40" alt="" />
          )
        )}
      </div>

      {/* Center Static Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-[5]">
        <h1 className="text-[180px] font-black text-white/5 tracking-tighter leading-none">monkbin</h1>
        <div className="flex flex-col items-center mt-[-10px]">
          <span className="text-2xl font-light text-white/10 tracking-[0.4em] uppercase tabular-nums">
             {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[10px] font-bold text-white/5 uppercase tracking-[0.3em] mt-2">
            {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Left Sidebar Layout */}
      <div className="absolute top-0 bottom-0 left-0 w-24 flex flex-col items-center py-6 gap-5 z-10 overflow-y-auto no-scrollbar pt-10">
        {SIDEBAR_APPS.map((app, i) => (
          <motion.button 
            key={app.title + i} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openApp(app.id)}
            className="flex flex-col items-center gap-1.5 w-full group"
          >
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center border-white/5 group-hover:border-white/20 transition-all">
              <app.icon className={`w-5 h-5 ${app.color} group-hover:text-white transition-colors`} />
            </div>
            <span className="text-[9px] font-bold text-white/30 group-hover:text-white/80 transition-colors text-center truncate w-full px-1">{app.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Pagination dots (bottom right) */}
      <div className="absolute bottom-24 right-8 flex flex-col gap-1.5 z-10">
        {[1, 0.3, 0.3, 0.3, 0.3, 0.3].map((op, i) => (
           <div key={i} className="w-1.5 h-1.5 rounded-full bg-white transition-opacity" style={{ opacity: op }} />
        ))}
      </div>

      {/* Window Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <AnimatePresence>
          {openWindows.map(win => {
            const app = APPS.find(a => a.id === win.id);
            if (!app || win.isMinimized) return null;
            return (
              <Window 
                key={win.id}
                id={win.id}
                title={app.title}
                icon={app.icon}
                color={app.color}
                zIndex={win.zIndex}
                isActive={activeWindow === win.id}
                onFocus={() => focusApp(win.id)}
                onClose={() => closeApp(win.id)}
                onMinimize={() => minimizeApp(win.id)}
                initialX={100 + (openWindows.indexOf(win) * 30)}
                initialY={60 + (openWindows.indexOf(win) * 30)}
              >
                <AppContent 
                  id={win.id} 
                  cloak={cloak}
                  setCloak={setCloak} 
                  setTheme={setTheme} 
                  theme={theme} 
                  setWallpaper={setWallpaper}
                  performance={performance}
                  setPerformance={setPerformance}
                  animations={animations}
                  setAnimations={setAnimations}
                  winUrl={win.url}
                  openApp={openApp}
                />
              </Window>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Dock */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[100] pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-2 p-2 px-6 glass-strong rounded-3xl border-white/5 shadow-2xl">
          <div className="flex items-center gap-1.5">
            <button className="flex flex-col items-center gap-1 group px-3 py-1 rounded-xl hover:bg-white/5 transition-all" onClick={() => openApp('browser')}>
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1c] border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all">
                <Compass size={20} className="text-white/60 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors">Browser</span>
            </button>
            <button className="flex flex-col items-center gap-1 group px-3 py-1 rounded-xl hover:bg-white/5 transition-all" onClick={() => openApp('games')}>
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1c] border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all">
                <Gamepad2 size={20} className="text-white/60 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors">Games</span>
            </button>
            <button className="flex flex-col items-center gap-1 group px-3 py-1 rounded-xl hover:bg-white/5 transition-all" onClick={() => openApp('settings')}>
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1c] border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all">
                <Settings size={20} className="text-white/60 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors">Settings</span>
            </button>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 tabular-nums pr-2">
             <div className="flex flex-col items-center border-l border-white/10 pl-4">
                <span className="text-white/80 text-[12px] leading-none">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[9px] opacity-60 mt-1">{time.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
             </div>
          </div>
        </nav>
      </div>

      {/* Footer Credit */}
      <div className="absolute bottom-1.5 left-0 right-0 flex justify-center z-[5] pointer-events-none">
        <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.2em]">frosty_0_0. helped out</span>
      </div>
    </div>
  );
}
