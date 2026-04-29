import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import CheerModal from './CheerModal';

export default function CircleMembersList({ members = [], currentUser, circleId }) {
  const [target, setTarget] = useState(null);

  return (
    <>
      <div className="mb-6">
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 9,
          fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.4)', marginBottom: 12,
        }}>Circle · {members.length} {members.length === 1 ? 'fan' : 'fans'}</p>

        <div className="space-y-2">
          {members.map((m, i) => {
            const isMe = m.user_email === currentUser?.email;
            const initial = (m.user_name || m.user_email || '?').charAt(0).toUpperCase();
            return (
              <motion.div
                key={m.user_email}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #1a3aad, #4d7fff)',
                    color: '#fff',
                    fontFamily: 'Bebas Neue, Impact, sans-serif',
                    fontSize: 16, letterSpacing: '0.04em',
                  }}
                >{initial}</div>
                <div className="flex-1 min-w-0">
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
                    fontWeight: 600, color: '#0d1117',
                  }} className="truncate">
                    {m.user_name || m.user_email?.split('@')[0]}
                    {isMe && <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 11, color: 'rgba(0,0,0,0.35)', marginLeft: 6 }}>· you</span>}
                  </p>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: 9,
                    fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(0,0,0,0.35)',
                  }}>
                    Joined {new Date(m.joined_date).toLocaleDateString()}
                  </p>
                </div>
                {!isMe && (
                  <button
                    onClick={() => setTarget(m)}
                    className="flex items-center gap-1.5"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontSize: 10,
                      fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                      background: 'linear-gradient(135deg, #1a3aad, #0d1f6b)',
                      color: '#fff', borderRadius: 10, padding: '7px 12px',
                    }}
                  >
                    <Heart className="w-3 h-3" /> Cheer
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <CheerModal
        isOpen={!!target}
        onClose={() => setTarget(null)}
        recipient={target}
        circleId={circleId}
        sender={currentUser}
      />
    </>
  );
}