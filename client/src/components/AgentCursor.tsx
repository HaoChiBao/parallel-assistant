import React from 'react';

interface Props {
  x: number;
  y: number;
}

export const AgentCursor: React.FC<Props> = ({ x, y }) => {
  return (
    <div 
      className="agent-cursor" 
      style={{ top: y, left: x }}
    />
  );
};
