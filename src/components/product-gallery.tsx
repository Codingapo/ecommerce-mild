"use client";
import { useState } from "react";
export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(images[0]);
  return (
    <div>
      <div className="detail-image">
        <img src={selected} alt={name} />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              aria-label={`View ${name}, image ${index + 1}`}
              aria-pressed={url === selected}
              onClick={() => setSelected(url)}
            >
              <img src={url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
