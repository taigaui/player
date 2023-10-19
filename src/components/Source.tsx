import React, { useState } from 'react';

import styles from './Source.module.scss';
import { SourceItem } from '../types';

interface SourceProps {
  sources: SourceItem[];
  currentSource?: SourceItem;
  onChangeSource: (key: string) => void;
}

export const Source: React.FC<SourceProps> = ({
  sources,
  currentSource,
  onChangeSource,
}) => {
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);

  return (
    <div className={styles.source}>
      <button onClick={() => setSourcePickerOpen(open => !open)}>
        {currentSource?.name}
      </button>
      {sourcePickerOpen && (
        <div className={styles.picker}>
          <ul>
            {sources.map(({ key, name }) => (
              <li
                key={key}
                onClick={() => {
                  onChangeSource(key);
                  setSourcePickerOpen(false);
                }}
              >
                <button>{name}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
