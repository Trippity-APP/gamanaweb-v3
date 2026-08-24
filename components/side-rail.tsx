"use client";

import GlobalStickyDownload from "@/components/global-sticky-download";
import { FeedbackWidget } from "@/components/marketplace/FeedbackWidget";

/**
 * Single right-edge rail holding both persistent side CTAs — the scroll-triggered,
 * dismissible "Get App" panel and the always-available Feedback button — stacked in one
 * column. They were previously two independent components both fixed at
 * `right-0 top-1/2`, so the Get App panel rendered directly on top of the Feedback
 * button and hid it completely.
 *
 * Rendered once from the root layout, so Feedback is now reachable from anywhere on the
 * site rather than only the two Marketplace pages. That's deliberate: someone who
 * bounces off Cities or a Blog post is exactly the visitor worth hearing from, and the
 * widget is no longer login-gated.
 *
 * Each child controls its own visibility (Get App hides until 60% scroll and can be
 * dismissed for the session).
 *
 * They're anchored independently rather than stacked in one flex column: a shared column
 * is centred on its *combined* height, so the Feedback button jumped downward the moment
 * the Get App panel appeared on scroll and back up when it was dismissed. Giving Feedback
 * its own fixed offset below centre keeps it perfectly still for the whole session, with
 * enough clearance that the Get App panel never overlaps it.
 */
export default function SideRail() {
  return (
    <>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <GlobalStickyDownload />
      </div>
      <div className="fixed right-0 top-1/2 translate-y-[120px] z-50">
        <FeedbackWidget />
      </div>
    </>
  );
}
