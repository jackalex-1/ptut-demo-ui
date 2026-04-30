"use client";

import { useSyncExternalStore } from "react";

/**
 * Viewports strictly wider than this (CSS px) use the static hero image.
 * Narrower viewports use the looping background video (mobile).
 *
 * Matches common `md` breakpoint (768px): phones and small tablets get video.
 */
const MOBILE_VIDEO_QUERY = "(max-width: 767px)";

function subscribeMobileVideoQuery(onStoreChange: () => void) {
  const mq = window.matchMedia(MOBILE_VIDEO_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobileVideoSnapshot() {
  return window.matchMedia(MOBILE_VIDEO_QUERY).matches;
}

/**
 * Server and the first hydrated client frame assume desktop so markup matches
 * and we avoid downloading the video on large screens.
 */
function getMobileVideoServerSnapshot() {
  return false;
}

/** Decorative full-viewport background: image on laptop/desktop, video on mobile. */
export function BackgroundMedia() {
  const useVideo = useSyncExternalStore(
    subscribeMobileVideoQuery,
    getMobileVideoSnapshot,
    getMobileVideoServerSnapshot,
  );

  if (useVideo) {
    return (
      <video
        autoPlay
        className="bg-video"
        disablePictureInPicture
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/home_page_video.mp4" type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      alt=""
      className="bg-image"
      decoding="async"
      fetchPriority="high"
      height={736}
      src="/bg-image-v1.png"
      width={1408}
    />
  );
}
