import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContestant } from '../context/ContestantContext';
import { QRCodeCanvas } from 'qrcode.react';
import './RegistrationInfo.css';

const RegistrationInfo: React.FC = () => {
  const { user } = useAuth();
  const { contests, currentContestId } = useContestant();
  const [now, setNow] = useState(new Date());
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState({ x: 30, y: 30 });

  // 定時刷新時間
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 動態水印移動
  useEffect(() => {
    const move = () => {
      setWatermarkPos(pos => {
        let nx = pos.x + (Math.random() - 0.5) * 20;
        let ny = pos.y + (Math.random() - 0.5) * 20;
        nx = Math.max(0, Math.min(70, nx));
        ny = Math.max(0, Math.min(70, ny));
        return { x: nx, y: ny };
      });
    };
    const timer = setInterval(move, 1200);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');

  // 根據比賽與用戶查找個人資料
  const contest = contests.find(c => c.id === currentContestId);
  const info = contest?.contestants.find(c => c.idNumber === user?.idNumber && c.name === user?.name);
  const notice = contest?.notice || '';
  const noticeList = notice.split(/\n|\r/).filter(line => line.trim()).map(line => line.replace(/^\d+\./, '').trim());

  // 條件渲染
  if (!info) {
    return (
      <div className="reg-info-container">
        <h2 style={{ color: 'red', textAlign: 'center', margin: '2rem 0' }}>查無您的參賽資料，請確認登入資訊與比賽選擇。</h2>
      </div>
    );
  }

  return (
    <div className="reg-info-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* 動態水印 */}
      <div
        className="moving-watermark"
        style={{
          left: `${watermarkPos.x}%`,
          top: `${watermarkPos.y}%`,
          opacity: 0.18,
          fontSize: '2.2rem',
          fontWeight: 700,
          color: '#2176ff',
          userSelect: 'none',
          letterSpacing: '0.2em',
          textShadow: '0 2px 8px #fff',
          transition: 'left 1.1s linear, top 1.1s linear',
        }}
      >
        澳門學聯電子參賽證
      </div>
      {/* 主要內容 */}
      <div className="reg-info-content">
        <div className="reg-info-header">
          <div className="reg-info-title">
            <div className="reg-info-logo" />
            <div>
              <div>第四十三屆全澳學生毛筆書法比賽</div>
              <div>電子參賽證</div>
            </div>
          </div>
          <div className="reg-info-actions">
            <button>自助列印</button>
            <button>保存至相簿</button>
          </div>
        </div>
        <div className="reg-info-main">
          <div className="reg-info-qrcode">
            <QRCodeCanvas value={info.number} size={140} />
            <div className="reg-info-time">
              當前時間<br />
              {timeString}
            </div>
          </div>
          <div className="reg-info-detail">
            <div className="stamp" />
            <div>參賽編號　<span className="important">{info.number}</span></div>
            <div>比賽課室　<span>{info.room}</span></div>
            <div>姓名　<span className="important">{info.name}</span></div>
            <div>學校　<span>{info.school}</span></div>
            <div>組別　<span>{info.group}</span></div>
            <div>證件編號　<span>{info.docId}</span></div>
          </div>
        </div>
        <div className="reg-info-notice">
          <div className="reg-info-notice-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>比賽須知</span>
            <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setNoticeOpen(v => !v)}>{noticeOpen ? '▲' : '▼'}</button>
          </div>
          {noticeOpen && (
            <div className="reg-info-notice-content">
              <ul>
                {noticeList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationInfo; 