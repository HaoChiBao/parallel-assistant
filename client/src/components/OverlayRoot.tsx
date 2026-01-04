import React from 'react';

interface Props {
  visible: boolean;
  children: React.ReactNode;
}

export const OverlayRoot: React.FC<Props> = ({ visible, children }) => {
  return (
    <div className={`overlay-root ${visible ? 'visible' : ''}`}>
      {children}
    </div>
  );
};
