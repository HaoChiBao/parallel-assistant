import React from 'react';

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export const HighlightBox: React.FC<Props> = ({ x, y, width, height, label = "Target" }) => {
  return (
    <div 
      className="highlight-box"
      style={{
        left: x,
        top: y,
        width: width,
        height: height
      }}
    >
      <div className="highlight-label">{label}</div>
    </div>
  );
};
