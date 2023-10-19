import React from 'react';
import {
  MdVolumeUp,
  MdVolumeDown,
  MdVolumeOff,
  MdVolumeMute,
} from 'react-icons/md/index.js';

import styles from './Volume.module.scss';

interface VolumeProps {
  volume: number;
  muted: boolean;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
}

export const Volume: React.FC<VolumeProps> = ({
  volume,
  muted,
  setVolume,
  setMuted,
}) => {
  return (
    <div className={styles.volume}>
      <button
        onClick={() => {
          setMuted(!muted);
        }}
      >
        {muted ? (
          <MdVolumeOff />
        ) : (
          <>
            {volume === 0 && <MdVolumeMute />}
            {volume > 0 && volume < 0.5 && <MdVolumeDown />}
            {volume >= 0.5 && <MdVolumeUp />}
          </>
        )}
      </button>
      <div
        className={styles.slider}
        onClick={e => {
          e.stopPropagation();
          const bounds = e.currentTarget.getBoundingClientRect();
          const frac = (e.clientX - bounds.left) / bounds.width;
          setVolume(frac);
        }}
      >
        <div className={styles.fill} style={{ width: `${volume * 100}%` }} />
        <div className={styles.circle} style={{ left: `${volume * 100}%` }} />
      </div>
    </div>
  );
};
