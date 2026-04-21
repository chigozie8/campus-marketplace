'use client';

import { useEffect } from 'react';

export default function EnjoChat() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).ENJO_WEBCHAT_ID = "69e790a16ab43364c44c0543";
    (window as any).ENJO_API_URL = "https://api.app.enjo.ai";
    (window as any).$enjo = (window as any).$enjo || [];

    const scriptId = "enjoWebchatCopilot";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://app.enjo.ai/webchat/js/webchat.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return <div className="enjo-webchat-container" />;
}
