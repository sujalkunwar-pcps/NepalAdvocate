import React from 'react';
import { Home, Scale, Bot, FileText, User } from 'lucide-react-native';
import { FloatingDockNav, NavItem } from './ui/floating-dock-navigation';

export type TabKey = 'home' | 'lawyers' | 'ai' | 'documents' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: NavItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: <Home size={20} />,
    },
    {
      key: 'lawyers',
      label: 'Lawyers',
      icon: <Scale size={20} />,
    },
    {
      key: 'ai',
      label: 'AI Assistant',
      icon: <Bot size={20} />,
    },
    {
      key: 'documents',
      label: 'Vault',
      icon: <FileText size={20} />,
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: <User size={20} />,
    },
  ];

  return (
    <FloatingDockNav
      items={tabs}
      activeTabKey={activeTab}
      onSelectTab={(key) => onSelectTab(key as TabKey)}
    />
  );
};
