import React from 'react';
import TopBar from '@/components/panels/TopBar';
import TimelineView from '@/components/panels/TimelineView';

export default function TimelinePage() {
  return (
    <div className="h-full flex flex-col bg-garden-bg overflow-hidden">
      <TopBar />
      <TimelineView />
    </div>
  );
}
