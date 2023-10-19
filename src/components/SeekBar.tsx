import React, { useState } from 'react';

import styles from './SeekBar.module.scss';
import { humanTimestamp } from '../helpers';

interface SeekBarProps {
  timeRanges?: TimeRanges;
  getThumbnailUrl?: (time: number) => string;
  time: number;
  duration: number;
  setTime(time: number): void;
}

export const SeekBar: React.FC<SeekBarProps> = ({
  getThumbnailUrl,
  time,
  duration,
  setTime,
  timeRanges,
}) => {
  const [hoverTime, setHoverTime] = useState(0);

  let ranges: { start: number; end: number }[] = [];
  if (timeRanges) {
    for (let i = 0; i < timeRanges.length; i++) {
      ranges.push({ start: timeRanges.start(i), end: timeRanges.end(i) });
    }
  }

  return (
    <div
      className={styles.bar}
      onClick={e => {
        e.stopPropagation();
        const bounds = e.currentTarget.getBoundingClientRect();
        const frac = (e.clientX - bounds.left) / bounds.width;
        setTime(frac * duration);
      }}
      onMouseMove={e => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const frac = (e.clientX - bounds.left) / bounds.width;
        setHoverTime(frac * duration);
      }}
      onDoubleClick={e => {
        e.stopPropagation();
      }}
    >
      {getThumbnailUrl && (
        <div
          className={styles.preview}
          style={{ '--left': `${(hoverTime / duration) * 100}%` } as any}
        >
          <img src={getThumbnailUrl(hoverTime)} alt="Video preview"></img>
          <span>{humanTimestamp(hoverTime)}</span>
        </div>
      )}
      <div
        className={styles.fill}
        style={{ width: `${(time / duration) * 100}%` }}
      ></div>
      <div
        className={styles.seek}
        style={{ width: `${(hoverTime / duration) * 100}%` }}
      ></div>
      <div
        className={styles.circle}
        style={{ left: `${(time / duration) * 100}%` }}
      ></div>
      {ranges.map(({ start, end }, i) => (
        <div
          key={i}
          className={styles.buffered}
          style={{
            left: `${(start / duration) * 100}%`,
            width: `${((end - start) / duration) * 100}%`,
          }}
        ></div>
      ))}
    </div>
  );
};
