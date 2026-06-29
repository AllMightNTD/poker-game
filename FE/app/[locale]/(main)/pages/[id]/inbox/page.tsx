'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, Settings, Bot, User, Phone, Mail, MoreVertical, X } from 'lucide-react';

export default function PageInboxPage() {
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState('messages');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user', text: 'Hello, what are your opening hours?', time: '10:00 AM' },
    { id: 2, sender: 'page', text: 'Hi there! We are open from 9 AM to 6 PM, Monday through Friday.', time: '10:01 AM' },
  ]);

  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('Xin chào! Chúng tôi sẽ phản hồi sớm nhất có thể.');
  const [faqList, setFaqList] = useState([
    { q: 'hours', a: 'We are open 9 AM to 6 PM.' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessages([...messages, { id: Date.now(), sender: 'page', text: message, time: 'Just now' }]);
    setMessage('');
  };

  const addFaq = () => {
    setFaqList([...faqList, { q: '', a: '' }]);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-[calc(100vh-56px)] flex overflow-hidden">
      
      {/* Left Sidebar - Chat List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h2>
          <div className="mt-4 flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'messages' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Messages
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors flex justify-center items-center gap-2 ${activeTab === 'settings' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Settings size={14} /> Settings
            </button>
          </div>
        </div>
        
        {activeTab === 'messages' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 cursor-pointer bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">Alice Smith</span>
                <span className="text-xs text-gray-500">10:01 AM</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">Hi there! We are open from...</p>
            </div>
            {/* More mock chats */}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 relative">
        {activeTab === 'messages' ? (
          <>
            <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Alice Smith</h3>
                  <p className="text-xs text-green-500 font-medium">Active now</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'page' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === 'page' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'}`}>
                    <p>{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${msg.sender === 'page' ? 'text-blue-100' : 'text-gray-400'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={!message.trim()}
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Bot size={24} className="text-blue-500" /> Auto-Reply Settings
            </h2>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Enable Auto-Reply</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Automatically respond to new messages when you're away.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoReplyEnabled} onChange={(e) => setAutoReplyEnabled(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {autoReplyEnabled && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Welcome Message</label>
                    <textarea 
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Frequently Asked Questions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Set up automated responses for specific keywords.</p>
              
              <div className="space-y-4 mb-4">
                {faqList.map((faq, index) => (
                  <div key={index} className="flex gap-4 items-start bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Keyword / Question</label>
                        <input type="text" value={faq.q} onChange={(e) => { const n = [...faqList]; n[index].q = e.target.value; setFaqList(n); }} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Automated Answer</label>
                        <textarea value={faq.a} onChange={(e) => { const n = [...faqList]; n[index].a = e.target.value; setFaqList(n); }} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-white" rows={2} />
                      </div>
                    </div>
                    <button onClick={() => setFaqList(faqList.filter((_, i) => i !== index))} className="mt-6 p-2 text-gray-400 hover:text-red-500 rounded-md">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addFaq} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                + Add FAQ rule
              </button>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Right Sidebar - User Info */}
      {activeTab === 'messages' && (
        <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hidden lg:flex flex-col shrink-0 p-6 overflow-y-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Alice Smith</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Follows Tech Innovations</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <User size={16} className="text-gray-400" /> Profile
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <Phone size={16} className="text-gray-400" /> +1 234 567 890
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <Mail size={16} className="text-gray-400" /> alice@example.com
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
