import React, { useEffect, useRef, useState } from 'react';
import {
  MdPlayArrow,
  MdPause,
  MdFullscreen,
  MdFullscreenExit,
} from 'react-icons/md/index.js';
import HLS from 'hls.js';
import DASH from 'dashjs';
import clsx from 'clsx';

import styles from './Player.module.scss';
import { humanTimestamp } from './helpers.js';
import { Loading } from './components/Loading.js';
import { SeekBar } from './components/SeekBar.js';
import { Volume } from './components/Volume.js';
import { SourceItem } from './types';
import { Source } from './components/Source';

interface Props {
  sources: SourceItem[];
  defaultSource?: SourceItem['key'];
  poster?: string;
  getThumbnailUrl?: (time: number) => string;
  mode?: 'hls' | 'dash' | 'default';
  allowFullscreen?: boolean;
  accentColor?: string;
}

export const Player: React.FC<Props> = ({
  sources,
  defaultSource,
  poster,
  getThumbnailUrl,
  mode,
  allowFullscreen,
  accentColor = '#55f',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<DASH.MediaPlayerClass>();
  const oldTimeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [timeRanges, setTimeRanges] = useState<TimeRanges>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sourceKey, setSourceKey] = useState(defaultSource);

  useEffect(() => {
    setSourceKey(defaultSource);
  }, [setSourceKey, defaultSource]);

  useEffect(() => {
    if (!videoRef.current || !sources.length) {
      return;
    }

    const video = videoRef.current;
    const url = sources.find(source => source.key === sourceKey)?.url;

    if (!url) {
      return;
    }

    if (mode === 'hls') {
      if (HLS.isSupported()) {
        const hls = new HLS();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    } else if (mode === 'dash') {
      dashRef.current?.destroy();
      const player = DASH.MediaPlayer().create();
      player.updateSettings({
        debug: {
          logLevel: 5,
        },
        streaming: {},
      });
      player.initialize(video, url, false);
      dashRef.current = player;
    } else {
      video.src = url;
    }
  }, [sources, sourceKey, mode]);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const storedVolume = localStorage.getItem('taigaui-player-volume');
    const storedMuted = localStorage.getItem('taigaui-player-muted');

    if (typeof storedVolume === 'string') {
      video.volume = parseFloat(storedVolume);
    }

    if (typeof storedMuted === 'string') {
      video.muted = !!parseInt(storedMuted);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === divRef.current);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [setIsFullscreen]);

  const updateVolume = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setMuted(video.muted);
    setVolume(video.volume);
    localStorage.setItem('taigaui-player-volume', video.volume.toString());
    localStorage.setItem('taigaui-player-muted', video.muted ? '1' : '0');
  };

  const updateTime = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    updateVolume(e);
    const video = e.currentTarget;
    setDuration(video.duration);
    if (video.currentTime === 0 && oldTimeRef.current > 0) {
      video.currentTime = oldTimeRef.current;
      setTime(oldTimeRef.current);
      oldTimeRef.current = 0;
    } else {
      setTime(video.currentTime);
    }
    setTimeRanges(video.buffered);
  };

  const updateState = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    updateVolume(e);
    const video = e.currentTarget;
    setIsWaiting(video.readyState < video.HAVE_FUTURE_DATA);
    setIsPlaying(!video.paused);
  };

  const play = () => {
    const video = videoRef.current!;
    const isPlaying =
      video.currentTime > 0 &&
      !video.paused &&
      !video.ended &&
      video.readyState > video.HAVE_CURRENT_DATA;

    if (!isPlaying) {
      video.play();
    }
  };

  const togglePlayback = () => {
    const video = videoRef.current!;

    if (!isPlaying) {
      play();
    } else {
      video.pause();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (allowFullscreen) {
      divRef.current!.requestFullscreen();
    }
  };

  const source = sources.find(s => s.key === sourceKey);

  return (
    <div
      className={clsx(styles.video, {
        [styles.paused]: !isPlaying,
        [styles.fullscreen]: isFullscreen,
      })}
      style={{ '--accent-color': accentColor } as any}
      ref={divRef}
    >
      <video
        ref={videoRef}
        controls={false}
        playsInline
        onVolumeChange={updateVolume}
        onDurationChange={updateTime}
        onTimeUpdate={updateTime}
        onProgress={updateTime}
        onCanPlay={updateState}
        onLoad={updateState}
        onWaiting={updateState}
        onPause={updateState}
        onPlaying={updateState}
        onPlay={updateState}
        poster={poster}
      />
      {isWaiting && (
        <div className={styles.hud}>
          <Loading />
        </div>
      )}
      {isPlaying && (
        <div className={styles.hud}>
          <div className={clsx(styles.icon, styles.hide)}>
            <MdPlayArrow />
          </div>
        </div>
      )}
      {!isPlaying && (
        <div className={styles.hud}>
          <div className={clsx(styles.icon, styles.hide)}>
            <MdPause />
          </div>
        </div>
      )}
      <div
        className={styles.overlay}
        onClick={togglePlayback}
        onDoubleClick={toggleFullscreen}
      >
        <SeekBar
          duration={duration}
          setTime={time => {
            videoRef.current!.currentTime = time;
            setTime(time);
          }}
          time={time}
          getThumbnailUrl={getThumbnailUrl}
          timeRanges={timeRanges}
        />
        <div
          className={styles.controls}
          onClick={e => e.stopPropagation()}
          onDoubleClick={e => {
            e.stopPropagation();
          }}
        >
          <div className={styles.left}>
            <button onClick={togglePlayback}>
              {isPlaying ? <MdPause /> : <MdPlayArrow />}
            </button>
            <Volume
              muted={muted}
              setMuted={muted => {
                videoRef.current!.muted = !muted;
                setMuted(muted);
              }}
              volume={volume}
              setVolume={volume => {
                videoRef.current!.volume = volume;
                setVolume(volume);
              }}
            />
            <div className={styles.progress}>
              {humanTimestamp(time)} / {humanTimestamp(duration)}
            </div>
          </div>
          <div className={styles.right}>
            <Source
              sources={sources}
              currentSource={source}
              onChangeSource={key => {
                oldTimeRef.current = videoRef.current!.currentTime;
                setSourceKey(key);
              }}
            />
            {allowFullscreen && (
              <button onClick={toggleFullscreen}>
                {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
