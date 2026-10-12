import React from 'react';

interface ReactionIconProps {
  className?: string;
  size?: number;
}

export function FbLikeIcon({ className = '', size = 28 }: ReactionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 group-hover:scale-125 ${className}`}
    >
      <circle cx="18" cy="18" r="18" fill="url(#fb_like_grad)" />
      <path
        d="M26.2 17.5C26.2 16.5 25.4 15.7 24.4 15.7H20.8C21.1 14.1 21.6 12 21.6 11C21.6 9.3 20.7 8.5 19.8 8.5C18.8 8.5 18.2 9.4 17.7 10.7C17.1 12.3 15.8 14.7 14.8 15.7V25.5C16.3 25.5 18.2 26 19.7 26H23.5C24.7 26 25.7 25.1 25.9 24L26.8 19.3C27 18.4 26.6 17.6 26.2 17.5Z"
        fill="white"
      />
      <rect x="9.5" y="15.7" width="3.8" height="9.8" rx="1.2" fill="white" />
      <defs>
        <linearGradient id="fb_like_grad" x1="18" y1="0" x2="18" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2196F3" />
          <stop offset="1" stopColor="#0B63CE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FbLoveIcon({ className = '', size = 28 }: ReactionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 group-hover:scale-125 ${className}`}
    >
      <circle cx="18" cy="18" r="18" fill="url(#fb_love_grad)" />
      <path
        d="M18 26.3C17.5 26.3 10.5 21.2 10.5 15.3C10.5 12.3 12.8 10 15.7 10C17.3 10 18.8 10.8 19.7 12C20.6 10.8 22.1 10 23.7 10C26.6 10 28.9 12.3 28.9 15.3C28.9 21.2 21.9 26.3 21.4 26.3L18 26.3Z"
        fill="white"
      />
      <defs>
        <linearGradient id="fb_love_grad" x1="18" y1="0" x2="18" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB5E7C" />
          <stop offset="1" stopColor="#E41E3F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FbSadIcon({ className = '', size = 28 }: ReactionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 group-hover:scale-125 ${className}`}
    >
      <circle cx="18" cy="18" r="18" fill="url(#fb_sad_grad)" />
      {/* Eyebrows */}
      <path d="M12.5 13.2C13.8 14 15.2 14.5 16.5 14.5" stroke="#7A4D00" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M23.5 13.2C22.2 14 20.8 14.5 19.5 14.5" stroke="#7A4D00" strokeWidth="1.6" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="14" cy="17" rx="1.8" ry="2.2" fill="#3E2723" />
      <ellipse cx="22" cy="17" rx="1.8" ry="2.2" fill="#3E2723" />
      {/* Sad Mouth */}
      <path d="M14.5 24.5C16 23 20 23 21.5 24.5" stroke="#7A4D00" strokeWidth="1.8" strokeLinecap="round" />
      {/* Teardrop */}
      <path
        d="M23.5 20C23.5 20 25.5 22.5 25.5 24C25.5 25.1 24.6 26 23.5 26C22.4 26 21.5 25.1 21.5 24C21.5 22.5 23.5 20 23.5 20Z"
        fill="#29B6F6"
      />
      <defs>
        <linearGradient id="fb_sad_grad" x1="18" y1="0" x2="18" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD54F" />
          <stop offset="1" stopColor="#FFB300" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FbClapIcon({ className = '', size = 28 }: ReactionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 group-hover:scale-125 ${className}`}
    >
      <circle cx="18" cy="18" r="18" fill="url(#fb_clap_grad)" />
      {/* Clapping Hands Silhouette */}
      <path
        d="M14.8 13.5C14.2 12.8 13.2 12.8 12.5 13.5C11.8 14.2 11.8 15.2 12.5 15.8L15.5 18.8L13 21.3C12.3 22 12.3 23 13 23.7C13.7 24.4 14.7 24.4 15.3 23.7L18.5 20.5L20.8 22.8C21.5 23.5 22.5 23.5 23.2 22.8C23.9 22.1 23.9 21.1 23.2 20.4L18.2 15.4C17.5 14.7 16.5 14.7 15.8 15.4L14.8 13.5Z"
        fill="white"
      />
      <circle cx="23.5" cy="12.5" r="1.5" fill="#FFE082" />
      <circle cx="12" cy="10" r="1.2" fill="#FFE082" />
      <circle cx="26" cy="17" r="1.2" fill="#FFE082" />
      <defs>
        <linearGradient id="fb_clap_grad" x1="18" y1="0" x2="18" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FbHelpfulIcon({ className = '', size = 28 }: ReactionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 group-hover:scale-125 ${className}`}
    >
      <circle cx="18" cy="18" r="18" fill="url(#fb_bulb_grad)" />
      {/* Lightbulb */}
      <path
        d="M18 10C14.7 10 12 12.7 12 16C12 18.2 13.2 20.1 15 21.1V23C15 23.6 15.4 24 16 24H20C20.6 24 21 23.6 21 23V21.1C22.8 20.1 24 18.2 24 16C24 12.7 21.3 10 18 10ZM16.5 25.5C16.5 25.8 16.7 26 17 26H19C19.3 26 19.5 25.8 19.5 25.5V25H16.5V25.5Z"
        fill="white"
      />
      <defs>
        <linearGradient id="fb_bulb_grad" x1="18" y1="0" x2="18" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}
