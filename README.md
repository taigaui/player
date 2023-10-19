# @taigaui/player

Video/audio player component for React.js.

## Features

- [x] HLS support
- [x] Dash support
- [x] Keyboard controls
- [x] Minimalist UI
- [x] Thumbnail preview

## Usage

```tsx
import React from 'react';
import { Player } from '@taigaui/player';

import '@taigaui/player/index.scss';

const App: React.FC = () => {
  const getThumbnailUrl = (time: number) =>
    `https://example.com/thumbnail/${Math.floor(time / 5) * 5}`;

  return (
    <div>
      <VideoPlayer
        sources={{
          key: '720p',
          name: '720p',
          url: 'https://example.com/720p/stream.dash',
        }}
        defaultSource="720p"
        getThumbnailUrl={getThumbnailUrl}
        poster={`https://example.com/poster`}
        mode="dash"
        allowFullscreen
      />
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```
