"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  title,
}: {
  images: { url: string; alt: string }[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0];

  if (!activeImage) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel overflow-hidden p-3">
        <div className="overflow-hidden rounded-[1.75rem] bg-white">
          <img src={activeImage.url} alt={activeImage.alt || title} className="aspect-[4/5] w-full object-cover" />
        </div>
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              className={`overflow-hidden rounded-2xl border p-1 ${
                index === activeIndex ? "border-ink bg-white" : "border-black/10 bg-white/70"
              }`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <img src={image.url} alt={image.alt || title} className="aspect-square w-full rounded-xl object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
