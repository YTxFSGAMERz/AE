// The active sound pack: a ROLE (what a template asks for) → file(s) in the user's
// library. An array = variants; SfxAt rotates through them deterministically so five
// rows in a list never sound like a machine gun. Swap files here to re-score everything.
export const SFX_PACK: Record<string, string | string[]> = {
  tick: ["rm_click_2", "rm_click_1", "mouse_click_2"],            // list item / node lands
  click: "mouse_click_2",                                           // UI click
  pop: ["mixkit-hard-pop-click-2364", "pop_1", "es_suction_pop_5"], // chip / number / pulse pops in
  whoosh: ["clean-fast-swooshaiff-14784", "short_whoosh", "rm_whoosh"], // element flies in (peak-aligned)
  whooshLong: "mixkit-cinematic-wind-swoosh-1471",                  // bigger reveal / page slides in
  strike: "rm_whoosh",                                              // strike-through swipe
  chime: "ding",                                                    // gentle confirmation
  success: "correct_sfx",                                           // "done" / all ticked
  win: "quick-win",                                                 // final total lands
  notify: "apple_notification",                                     // brand / tool reveal
  impact: "05_impact",                                              // big number / dark statement
  stamp: "heavy_object_hit_and_body_thud",                          // stamp slam
  register: "cash_register_kaching",                                // price / ₹ moment
  count: "display_digits_1",                                        // number counting up
  shutter: "camera-shutter-6305",                                   // screenshot / receipt appears
  riser: "es_riser_suction_5",                                      // tension into a reveal (peak-aligned)
  nope: "nope",                                                     // crossed out / rejected
  type: "keyboard_press",                                           // text typing
  body: "mixkit-cinematic-wind-swoosh-1471",                        // soft air under a heavy land (used by <Land>)
};
