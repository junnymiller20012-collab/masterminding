"use client";

import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

interface Props {
  url: string;
}

export function VideoPlayer({ url }: Props) {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        config={{
          youtube: { playerVars: { modestbranding: 1 } },
        }}
      />
    </div>
  );
}
