import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Contestant {
  idNumber: string;
  name: string;
  school: string;
  group: string;
  room: string;
  number: string;
  docId: string;
}

export interface Contest {
  id: string;
  name: string;
  contestants: Contestant[];
  notice: string;
}

interface ContestantContextType {
  contests: Contest[];
  setContests: (data: Contest[]) => void;
  currentContestId: string;
  setCurrentContestId: (id: string) => void;
  addContest: (name: string) => void;
  updateContest: (id: string, data: Partial<Contest>) => void;
}

const ContestantContext = createContext<ContestantContextType | undefined>(undefined);

export const ContestantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contests, setContests] = useState<Contest[]>([
    {
      id: 'default',
      name: '預設比賽',
      contestants: [],
      notice: '1. 參賽者必須準時出席並出示參賽證之電子圖片或列印紙本及有效身份證明文件...\n2. 比賽時間...（預設內容，可於後台修改）'
    }
  ]);
  const [currentContestId, setCurrentContestId] = useState('default');

  const addContest = (name: string) => {
    const id = 'contest_' + Date.now();
    setContests(prev => [...prev, { id, name, contestants: [], notice: '' }]);
    setCurrentContestId(id);
  };

  const updateContest = (id: string, data: Partial<Contest>) => {
    setContests(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  return (
    <ContestantContext.Provider value={{ contests, setContests, currentContestId, setCurrentContestId, addContest, updateContest }}>
      {children}
    </ContestantContext.Provider>
  );
};

export const useContestant = () => {
  const context = useContext(ContestantContext);
  if (!context) throw new Error('useContestant must be used within ContestantProvider');
  return context;
}; 