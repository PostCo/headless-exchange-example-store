"use client";

/**
 * Small dev-only modal shown when Proceed/Cancel is clicked on a test-mode
 * session. Replaces a bare window.alert. In test mode the SDK ends the session
 * (the bar drops) but never redirects — so this explains what happened and
 * tells the user to refresh to bring the bar back.
 */

const STYLES = `
.postco-tmm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.postco-tmm-card { background: #ffffff; color: #111111; max-width: 380px; width: 100%; border-radius: 12px; padding: 24px; box-shadow: 0 12px 40px rgba(0,0,0,0.2); font-family: inherit; }
.postco-tmm-badge { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #92400e; background: #fef3c7; padding: 4px 10px; border-radius: 999px; }
.postco-tmm-title { margin: 12px 0 6px; font-size: 18px; font-weight: 600; }
.postco-tmm-body { margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #444444; }
.postco-tmm-close { width: 100%; background: #111111; color: #ffffff; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 600; }
.postco-tmm-close:hover { opacity: 0.9; }
`;

interface TestModeModalProps {
  action: "proceed" | "cancel";
  onClose: () => void;
}

export function TestModeModal({ action, onClose }: TestModeModalProps) {
  const label = action === "proceed" ? "Proceed with exchange" : "Cancel";
  const realNote =
    action === "proceed"
      ? "In a real exchange you'd be redirected to the return center to submit your cart."
      : "In a real exchange your cart would be cleared and you'd return to item selection.";

  return (
    <div className="postco-tmm-overlay" role="dialog" aria-modal="true" aria-label="Test mode" onClick={onClose}>
      <style>{STYLES}</style>
      <div className="postco-tmm-card" onClick={(e) => e.stopPropagation()}>
        <span className="postco-tmm-badge">Test mode</span>
        <h2 className="postco-tmm-title">&ldquo;{label}&rdquo; clicked</h2>
        <p className="postco-tmm-body">
          {realNote} No real redirect happens in test mode. Refresh the page to show the status bar again.
        </p>
        <button type="button" className="postco-tmm-close" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
