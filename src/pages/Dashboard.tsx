import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useContestant, Contest, Contestant } from '../context/ContestantContext';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const PAGE_SIZE = 20;

const Dashboard: React.FC = () => {
  const {
    contests,
    setContests,
    currentContestId,
    setCurrentContestId,
    addContest,
    updateContest
  } = useContestant();
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'contestant' | 'notice'>('contestant');
  const [newContestName, setNewContestName] = useState('');
  const [noticeDraft, setNoticeDraft] = useState('');
  const [noticeSaved, setNoticeSaved] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const currentContest = contests.find(c => c.id === currentContestId) || contests[0];

  // 搜尋功能
  const filteredContestants = currentContest?.contestants.filter(c =>
    c.idNumber.includes(search) ||
    c.name.includes(search) ||
    c.school.includes(search) ||
    c.group.includes(search) ||
    c.room.includes(search) ||
    c.number.includes(search) ||
    c.docId.includes(search)
  ) || [];
  const totalPages = Math.ceil(filteredContestants.length / PAGE_SIZE);
  const pagedContestants = filteredContestants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // EXCEL 上傳與解析
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      const parsed: Contestant[] = json.map(row => ({
        idNumber: row['證件號碼'] || '',
        name: row['姓名'] || '',
        school: row['學校'] || '',
        group: row['組別'] || '',
        room: row['比賽課室'] || '',
        number: row['參賽編號'] || '',
        docId: row['證件編號'] || '',
      }));
      updateContest(currentContestId, { contestants: parsed });
      setPage(1);
    };
    reader.readAsBinaryString(file);
  };

  // 匯出EXCEL
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(currentContest.contestants);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '參賽者資料');
    XLSX.writeFile(wb, `${currentContest.name}_參賽者資料.xlsx`);
  };

  // 單筆刪除
  const handleDeleteContestant = (idx: number) => {
    if (window.confirm('確定要刪除此參賽者資料？')) {
      const newList = [...currentContest.contestants];
      newList.splice(idx, 1);
      updateContest(currentContestId, { contestants: newList });
    }
  };

  // 新增比賽
  const handleAddContest = () => {
    if (newContestName.trim()) {
      addContest(newContestName.trim());
      setNewContestName('');
    }
  };

  // 編輯比賽須知（草稿）
  React.useEffect(() => {
    setNoticeDraft(currentContest.notice);
    setNoticeSaved(false);
  }, [currentContestId, currentContest.notice]);

  // 儲存比賽須知
  const handleSaveNotice = () => {
    updateContest(currentContestId, { notice: noticeDraft });
    setNoticeSaved(true);
    setTimeout(() => setNoticeSaved(false), 1500);
    // TODO: 目前前端參賽證頁面未即時同步最新比賽須知內容，需後期優化為全局即時推送（如Context或API推送）
  };

  // 清空參賽者資料
  const handleRemoveContestants = () => {
    if (window.confirm('確定要移除本場比賽所有參賽者資料嗎？')) {
      updateContest(currentContestId, { contestants: [] });
      setPage(1);
    }
  };

  return (
    <div className="dashboard-root">
      {/* 側邊欄 */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-title">管理後台</div>
        <div
          className={`sidebar-link${activeTab === 'contestant' ? ' active' : ''}`}
          onClick={() => setActiveTab('contestant')}
        >參賽者管理</div>
        <div
          className={`sidebar-link${activeTab === 'notice' ? ' active' : ''}`}
          onClick={() => setActiveTab('notice')}
        >比賽須知</div>
      </aside>
      {/* 主內容 */}
      <div className="dashboard-main">
        {/* 頂部導航 */}
        <nav className="dashboard-navbar">
          <div className="navbar-title">澳門學聯電子參賽證管理系統</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* 比賽選擇器 */}
            <select
              value={currentContestId}
              onChange={e => setCurrentContestId(e.target.value)}
              style={{ fontSize: '1rem', padding: '0.3rem 0.7rem', borderRadius: 8 }}
            >
              {contests.map(contest => (
                <option key={contest.id} value={contest.id}>{contest.name}</option>
              ))}
            </select>
            {/* 新增比賽 */}
            <input
              type="text"
              value={newContestName}
              onChange={e => setNewContestName(e.target.value)}
              placeholder="新增比賽名稱"
              style={{ fontSize: '1rem', padding: '0.3rem 0.7rem', borderRadius: 8 }}
            />
            <button onClick={handleAddContest} style={{ background: '#2176ff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', fontWeight: 600 }}>新增</button>
            <button onClick={logout}>登出</button>
          </div>
        </nav>
        <div className="dashboard-content">
          {activeTab === 'contestant' && (
            <>
              <div className="dashboard-section">
                <h2>EXCEL 批量導入參賽者資料</h2>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button onClick={handleRemoveContestants} style={{ marginLeft: 16, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', fontWeight: 600 }}>移除本場所有資料</button>
                <button onClick={handleExportExcel} style={{ marginLeft: 16, background: '#3ecf8e', color: '#232946', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', fontWeight: 600 }}>匯出EXCEL</button>
                {/* Google Sheet/自動同步預留窗口 */}
                <div style={{ marginTop: '1rem', color: '#888', fontSize: '0.98rem', background: '#f0f4ff', borderRadius: 8, padding: '0.7rem 1rem' }}>
                  <b>Google Sheet/自動同步</b>（開發中，未來可直接連接 Google 表單或自動同步報名資料）
                </div>
              </div>
              <div className="dashboard-section">
                <h2>參賽者資料預覽</h2>
                <div style={{ marginBottom: 12 }}>
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="搜尋姓名、證件號碼、學校等..."
                    style={{ fontSize: '1rem', padding: '0.3rem 0.7rem', borderRadius: 8, width: 260 }}
                  />
                </div>
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>證件號碼</th>
                        <th>姓名</th>
                        <th>學校</th>
                        <th>組別</th>
                        <th>比賽課室</th>
                        <th>參賽編號</th>
                        <th>證件編號</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedContestants.map((c, idx) => (
                        <tr key={idx}>
                          <td>{c.idNumber}</td>
                          <td>{c.name}</td>
                          <td>{c.school}</td>
                          <td>{c.group}</td>
                          <td>{c.room}</td>
                          <td>{c.number}</td>
                          <td>{c.docId}</td>
                          <td>
                            <button onClick={() => handleDeleteContestant((page - 1) * PAGE_SIZE + idx)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '0.2rem 0.7rem', fontWeight: 600, fontSize: '0.95rem' }}>刪除</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* 分頁控制 */}
                {totalPages > 1 && (
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一頁</button>
                    <span>第 {page} / {totalPages} 頁</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一頁</button>
                  </div>
                )}
              </div>
            </>
          )}
          {activeTab === 'notice' && (
            <div className="dashboard-section">
              <h2>比賽須知內容編輯</h2>
              <textarea
                value={noticeDraft}
                onChange={e => { setNoticeDraft(e.target.value); setNoticeSaved(false); }}
                rows={12}
                style={{ width: '100%', fontSize: '1rem', padding: '0.5rem' }}
              />
              <button onClick={handleSaveNotice} style={{ marginTop: 12, background: '#2176ff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.4rem 1.2rem', fontWeight: 600 }}>儲存</button>
              {noticeSaved && <span style={{ marginLeft: 16, color: '#3ecf8e', fontWeight: 600 }}>已儲存！</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 