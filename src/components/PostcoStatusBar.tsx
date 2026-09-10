/**
 * PostCo Exchange status bar — React template.
 *
 * This is a COPY-A-TEMPLATE file. Once you run
 *   npx @postco/headless-exchange-sdk add status-bar
 * this file lives in YOUR repo and you own it: restyle it, translate the copy,
 * swap `window.confirm` for your own modal. Bug fixes to the exchange math/state
 * still flow through the `@postco/headless-exchange-sdk` npm package — never
 * reimplement them here.
 *
 * Usage (this store — see ExchangeStatusBar.tsx):
 *   "use client";
 *   import { useExchange } from "@/exchange/ExchangeProvider";
 *   import { PostcoStatusBar } from "./PostcoStatusBar";
 *
 *   const { controller } = useExchange(); // initExchange({ cart }) runs once in ExchangeProvider
 *   return controller ? <PostcoStatusBar controller={controller} /> : null;
 */

import { useEffect, useState } from "react";
import { type ExchangeController, type ExchangeState } from "@postco/headless-exchange-sdk";

const STYLES = `
.postco-hxsb-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #000000; z-index: 999; font-family: inherit; font-size: 16px; line-height: 1.4; }
.postco-hxsb-content { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; max-width: 1200px; margin: 0 auto; gap: 20px; }
.postco-hxsb-text { flex: 1; color: #ffffff; font-weight: 400; }
.postco-hxsb-mainline { font-size: 18px; font-weight: 600; color: #ffffff; }
.postco-hxsb-subline { margin-top: 4px; font-size: 14px; font-style: italic; opacity: 0.85; color: #ffffff; }
.postco-hxsb-actions { display: flex; align-items: center; gap: 16px; }
.postco-hxsb-cancel { background: transparent; color: #ffffff; border: none; padding: 8px 0; cursor: pointer; font-family: inherit; font-size: 16px; text-decoration: underline; }
.postco-hxsb-cancel:hover { opacity: 0.85; }
.postco-hxsb-proceed { background: #ffffff; color: #111111; border: 1px solid #e5e5e5; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 600; }
.postco-hxsb-proceed:disabled { opacity: 0.5; cursor: not-allowed; }
.postco-hxsb-label-mobile { display: none; }
@media (max-width: 768px) {
  .postco-hxsb-content { padding: 10px 16px; gap: 12px; }
  .postco-hxsb-mainline { font-size: 14px; line-height: 1.25; }
  .postco-hxsb-subline { font-size: 12px; margin-top: 2px; }
  .postco-hxsb-cancel { font-size: 14px; padding: 6px 0; }
  .postco-hxsb-proceed { font-size: 13px; padding: 6px 12px; border-radius: 6px; }
  .postco-hxsb-label-desktop { display: none; }
  .postco-hxsb-label-mobile { display: inline; }
}
@media (max-width: 360px) {
  .postco-hxsb-content { padding: 8px 12px; gap: 10px; }
  .postco-hxsb-mainline { font-size: 13px; }
  .postco-hxsb-subline { font-size: 11px; }
  .postco-hxsb-cancel { font-size: 13px; }
  .postco-hxsb-proceed { font-size: 12px; padding: 6px 10px; }
}
`;

function itemWord(count: number): string {
  return count === 1 ? "item" : "items";
}

/**
 * Format a decimal money string in a single currency. Falls back to the raw
 * string when the currency code is unknown (no active session).
 */
function formatMoney(amount: string, currencyCode: string): string {
  if (!currencyCode) return amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(Number(amount));
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

function mainLineText(state: ExchangeState): string {
  const count = `${state.itemCount} ${itemWord(state.itemCount)} selected`;
  if (Number(state.outstanding) > 0) {
    return `${count} — ${formatMoney(state.outstanding, state.currencyCode)} to pay later`;
  }
  return `${count} — ${formatMoney(state.leftToShop, state.currencyCode)} left to shop`;
}

interface PostcoStatusBarProps {
  controller: ExchangeController;
}

export function PostcoStatusBar({ controller }: PostcoStatusBarProps) {
  const [state, setState] = useState<ExchangeState>(() => controller.getState());

  useEffect(() => {
    // `subscribe` fires once immediately with the current state, then on every
    // cart change. Returns an unsubscribe fn.
    return controller.subscribe(setState);
  }, [controller]);

  if (!state.isExchangeSession) return null;

  // Proceed is enabled only once the cart is ready (equivalent to the
  // `cart_ready` status): a cart exists and belongs to an exchange session.
  const canProceed = state.cartId != null;

  const handleProceed = (): void => {
    // Real mode redirects to the return center. In test mode the SDK ends the
    // session and shows its own dev-only modal (no redirect).
    controller.proceedToExchange();
  };

  const handleCancel = async (): Promise<void> => {
    // Test mode: no real return center — the SDK shows its dev modal, so skip
    // the confirm.
    if (state.isTestMode) {
      await controller.cancelExchange();
      return;
    }
    // Optional confirmation — this popup is yours to keep, restyle, or remove.
    // `cancelExchange` does the rest (clear cart + session, build the URL,
    // redirect back).
    if (!window.confirm("Cancel this exchange? Your selected items will be removed.")) {
      return;
    }
    await controller.cancelExchange();
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="postco-hxsb-bar" role="region" aria-label="Exchange status">
        <div className="postco-hxsb-content">
          <div className="postco-hxsb-text">
            <div className="postco-hxsb-mainline">{mainLineText(state)}</div>
            {Number(state.bonusCredit) > 0 && (
              <div className="postco-hxsb-subline">
                {`${formatMoney(state.bonusCredit, state.currencyCode)} bonus credit included`}
              </div>
            )}
          </div>
          <div className="postco-hxsb-actions">
            <button type="button" className="postco-hxsb-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="postco-hxsb-proceed" onClick={handleProceed} disabled={!canProceed}>
              <span className="postco-hxsb-label-desktop">Proceed with exchange</span>
              <span className="postco-hxsb-label-mobile">Proceed</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
