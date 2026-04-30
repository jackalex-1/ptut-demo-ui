"use client";

import { X, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface TermsOverlayProps {
  onClose: () => void;
}

export function TermsOverlay({ onClose }: TermsOverlayProps) {
  const [text, setText] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/terms")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load terms");
        return res.text();
      })
      .then((t) => {
        if (!cancelled) setText(t);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="terms-fullpage-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="terms-fullpage-card">
        <div className="terms-fullpage-header">
          <div className="terms-fullpage-header-brand">
            <div className="terms-icon-wrap">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="terms-fullpage-title">Terms &amp; Conditions</h1>
              <p className="terms-fullpage-subtitle">CBD Punjab</p>
            </div>
          </div>
          <button type="button" className="terms-fullpage-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="terms-fullpage-body">
          {text === null && !loadError ? (
            <p className="terms-loading">Loading…</p>
          ) : null}
          {loadError ? (
            <p className="terms-loading">Unable to load terms. Please try again later.</p>
          ) : null}
          {text !== null ? <pre className="terms-verbatim">{text}</pre> : null}
        </div>
      </div>
    </div>
  );
}
