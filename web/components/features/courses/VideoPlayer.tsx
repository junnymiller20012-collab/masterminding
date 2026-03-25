"use client";

import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Props {
  url: string;
}

function isEmbedUrl(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv/i.test(url);
}

export function VideoPlayer({ url }: Props) {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      {isEmbedUrl(url) ? (
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls
          config={{
            youtube: { playerVars: { modestbranding: 1 } },
          }}
        />
      ) : (
        <video
          src={url}
          controls
          className="w-full h-full"
          playsInline
          preload="metadata"
        />
      )}
    </div>
  );
}
