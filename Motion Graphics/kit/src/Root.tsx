import React from "react";
import { Composition } from "remotion";
import { withStage } from "./Stage";
import { KineticStatement, kineticStatementDuration } from "./templates/KineticStatement";
import { StatCard, statCardDuration } from "./templates/StatCard";
import { MultiStat, multiStatDuration } from "./templates/MultiStat";
import { FocusList, focusListDuration } from "./templates/FocusList";
import { ValueStack, valueStackDuration } from "./templates/ValueStack";
import { Funnel, funnelDuration } from "./templates/Funnel";
import { BentoGrid, bentoGridDuration } from "./templates/BentoGrid";
import { Comparison, comparisonDuration } from "./templates/Comparison";
import { EndCard, endCardDuration } from "./templates/EndCard";
import { Timeline, timelineDuration } from "./templates/Timeline";
import { BarChart, barChartDuration } from "./templates/BarChart";
import { Quote, quoteDuration } from "./templates/Quote";
import { LowerThird, lowerThirdDuration } from "./templates/LowerThird";
import { LineChart, lineChartDuration } from "./templates/LineChart";
import { ProgressRing, progressRingDuration } from "./templates/ProgressRing";
import { StepFlow, stepFlowDuration } from "./templates/StepFlow";
import { Checklist, checklistDuration } from "./templates/Checklist";
import { DarkStatement, darkStatementDuration } from "./templates/DarkStatement";
import { ChapterCard, chapterCardDuration } from "./templates/ChapterCard";
import { Ticker, tickerDuration } from "./templates/Ticker";
import { CaptionPop, captionPopDuration } from "./templates/CaptionPop";
import { SideNotes, sideNotesDuration } from "./templates/SideNotes";
import { IconPop, iconPopDuration } from "./templates/IconPop";
import { NumberPop, numberPopDuration } from "./templates/NumberPop";
import { TitleStrap, titleStrapDuration } from "./templates/TitleStrap";
import { StepTracker, stepTrackerDuration } from "./templates/StepTracker";
import { HighlightRing, highlightRingDuration } from "./templates/HighlightRing";
import { StampBadge, stampBadgeDuration } from "./templates/StampBadge";
import { LogoBill, logoBillDuration } from "./templates/LogoBill";
import { FootageStatement, footageStatementDuration } from "./templates/FootageStatement";
import { StackTable, stackTableDuration } from "./templates/StackTable";
import { ToolCard, toolCardDuration } from "./templates/ToolCard";
import { ScreenFrame, screenFrameDuration } from "./templates/ScreenFrame";
import { PayFlow, payFlowDuration } from "./templates/PayFlow";
import { WordCaption, wordCaptionDuration } from "./templates/WordCaption";

const W = 1920, H = 1080, FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KineticStatement"
        component={withStage(KineticStatement)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={kineticStatementDuration()}
        defaultProps={{ first: "Information is everywhere.", second: "Execution is what's missing.", emphasis: "Execution" }}
      />
      <Composition
        id="StatCard"
        component={withStage(StatCard)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={statCardDuration()}
        defaultProps={{ value: 1200, suffix: "+", label: "signups this month", sub: "— without paid ads" }}
      />
      <Composition
        id="MultiStat"
        component={withStage(MultiStat)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={multiStatDuration()}
        defaultProps={{ kicker: "The results", stats: [ { value: 10, suffix: "h", label: "saved / week" }, { value: 3, suffix: "×", label: "faster shipping" }, { value: 40, label: "new customers" } ] }}
      />
      <Composition
        id="FocusList"
        component={withStage(FocusList)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={focusListDuration({ items: new Array(5).fill({ title: "x" }) } as any)}
        defaultProps={{
          kicker: "Why edits take so long",
          items: [
            { title: "Every graphic starts from scratch", sub: "Same shapes, rebuilt every time." },
            { title: "Assets are hunted by hand", sub: "Logos, screenshots, footage — all manual." },
            { title: "Sound is an afterthought", sub: "Added last, if at all." },
            { title: "Nothing is reusable", sub: "Last month's work helps you none." },
            { title: "So the edit slips", sub: "The video ships late, or plain." },
          ],
          step: 150, holdLast: 120, finalInk: false,
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: focusListDuration(props as any) })}
      />
      <Composition
        id="ValueStack"
        component={withStage(ValueStack)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={valueStackDuration({ items: new Array(5).fill({ title: "x", value: 1 }), price: 1 } as any)}
        defaultProps={{
          items: [
            { title: "Core template pack", value: 6000 },
            { title: "Asset fetchers", value: 5000 },
            { title: "Sound design system", value: 4000 },
            { title: "Render pipeline", value: 3000 },
            { title: "Docs and examples", value: 2000 },
          ],
          price: 1499,
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: valueStackDuration(props as any) })}
      />
      <Composition
        id="Funnel"
        component={withStage(Funnel)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={funnelDuration({ stages: new Array(3).fill({ value: 1, label: "x" }) } as any)}
        defaultProps={{
          kicker: "From visitor to customer",
          stages: [
            { value: 5000, suffix: "+", label: "visitors" },
            { value: 800, suffix: "+", label: "signed up" },
            { value: 120, label: "paid" },
          ],
          caption: "Where the drop-off actually happens.",
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: funnelDuration(props as any) })}
      />
      <Composition
        id="BentoGrid"
        component={withStage(BentoGrid)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={bentoGridDuration({ items: new Array(5).fill({ title: "x" }) } as any)}
        defaultProps={{
          kicker: "Who it's for",
          title: "Built for people who build",
          sub: "One kit, every kind of project.",
          items: [
            { icon: "app", title: "SaaS & AI products", sub: "Building apps with AI" },
            { icon: "bolt", title: "AI automations", sub: "Automating real workflows" },
            { icon: "briefcase", title: "AI agencies", sub: "Running an AI service business" },
            { icon: "store", title: "AI in your business", sub: "Adding AI to what you run" },
            { icon: "spark", title: "Aspiring founders", sub: "A plan to build with AI" },
          ],
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: bentoGridDuration(props as any) })}
      />
      <Composition
        id="Comparison"
        component={withStage(Comparison)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={comparisonDuration({ rows: new Array(5).fill({ label: "x", left: false, right: true }) } as any)}
        defaultProps={{
          kicker: "Why teams switch",
          leftTitle: "By hand",
          rightTitle: "With the kit",
          rows: [
            { label: "Consistent output", left: false, right: true },
            { label: "Built-in review step", left: false, right: true },
            { label: "Repeatable process", left: false, right: true },
            { label: "Reusable templates", left: false, right: true },
            { label: "Time per video", left: "8 hrs", right: "40 min" },
          ],
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: comparisonDuration(props as any) })}
      />
      <Composition
        id="EndCard"
        component={withStage(EndCard)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={endCardDuration()}
        defaultProps={{ brand: "Your Brand", url: "yourbrand.com", tagline: "Your closing line here" }}
      />
      <Composition
        id="Timeline"
        component={withStage(Timeline)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={timelineDuration({ items: new Array(4).fill({ label: "x" }) } as any)}
        defaultProps={{
          kicker: "The journey",
          title: "How it happened",
          items: [
            { tag: "Month 1", label: "Prototype", sub: "First version shipped" },
            { tag: "Month 2", label: "First users", sub: "Feedback loop started" },
            { tag: "Month 3", label: "Paid launch", sub: "Revenue begins" },
            { tag: "Today", label: "Scaling", sub: "Growing steadily" },
          ],
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: timelineDuration(props as any) })}
      />
      <Composition
        id="BarChart"
        component={withStage(BarChart)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={barChartDuration({ bars: new Array(5).fill({ label: "x", value: 1 }) } as any)}
        defaultProps={{
          kicker: "Revenue",
          title: "MRR by month",
          suffix: "",
          bars: [
            { label: "Jan", value: 20 },
            { label: "Feb", value: 55 },
            { label: "Mar", value: 90 },
            { label: "Apr", value: 140 },
            { label: "May", value: 250 },
          ],
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: barChartDuration(props as any) })}
      />
      <Composition
        id="Quote"
        component={withStage(Quote)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={quoteDuration()}
        defaultProps={{ quote: "It turned a two-day edit into an afternoon.", author: "A happy user", role: "Video editor" }}
      />
      <Composition
        id="LowerThird"
        component={withStage(LowerThird, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={lowerThirdDuration()}
        defaultProps={{ name: "Your Name", role: "Founder, Your Company" }}
      />
      <Composition
        id="LineChart"
        component={withStage(LineChart)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={lineChartDuration({ points: [] } as any)}
        defaultProps={{
          kicker: "Traffic",
          title: "Visitors over 5 months",
          points: [
            { label: "Jan", value: 20 },
            { label: "Feb", value: 45 },
            { label: "Mar", value: 80 },
            { label: "Apr", value: 150 },
            { label: "May", value: 250 },
          ],
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: lineChartDuration(props as any) })}
      />
      <Composition
        id="ProgressRing"
        component={withStage(ProgressRing)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={progressRingDuration()}
        defaultProps={{ kicker: "The reality", percent: 90, label: "of viewers drop before the point lands", sub: "Usually because nothing showed it." }}
      />
      <Composition
        id="StepFlow"
        component={withStage(StepFlow)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={stepFlowDuration({ steps: new Array(4).fill({ title: "x" }) } as any)}
        defaultProps={{
          kicker: "How it works",
          title: "From idea to shipped",
          steps: [
            { title: "Paste the script", sub: "Any length" },
            { title: "Get a shot list", sub: "Approve or edit" },
            { title: "Assets fetched", sub: "Real logos and pages" },
            { title: "Render", sub: "ProRes with alpha" },
          ],
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: stepFlowDuration(props as any) })}
      />
      <Composition
        id="Checklist"
        component={withStage(Checklist)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={checklistDuration({ items: new Array(4).fill({ title: "x" }) } as any)}
        defaultProps={{
          kicker: "Before you render",
          title: "Check each shot for…",
          items: [
            { title: "Text that fits its box" },
            { title: "Numbers clear of the lines" },
            { title: "Logos that render sharp" },
            { title: "Overlay off the face" },
          ],
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: checklistDuration(props as any) })}
      />
      <Composition
        id="DarkStatement"
        component={withStage(DarkStatement)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={darkStatementDuration({ lines: ["x", "y"] } as any)}
        defaultProps={{
          lines: ["A graphic should carry proof.", "The face carries the feeling."],
          emphasis: "carry proof",
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: darkStatementDuration(props as any) })}
      />
      <Composition
        id="ChapterCard"
        component={withStage(ChapterCard)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={chapterCardDuration()}
        defaultProps={{ index: 2, total: 5, title: "The offer", sub: "What you actually get" }}
      />
      <Composition
        id="Ticker"
        component={withStage(Ticker)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={tickerDuration()}
        defaultProps={{
          kicker: "One kit",
          title: "Every kind of shot",
          items: ["Stat cards", "Comparisons", "Funnels", "Screen frames", "Lower thirds"],
        }}
      />
      <Composition
        id="CaptionPop"
        component={withStage(CaptionPop, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={captionPopDuration({} as any)}
        defaultProps={{ text: "Zero to 1,000 users", emphasis: "1,000 users", emoji: "🚀", position: "bottom" as const }}
        calculateMetadata={({ props }) => ({ durationInFrames: captionPopDuration(props as any) })}
      />
      <Composition
        id="SideNotes"
        component={withStage(SideNotes, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={sideNotesDuration({ items: new Array(3).fill("x") } as any)}
        defaultProps={{
          kicker: "What you get",
          items: ["35 templates", "Real logos fetched", "Sound built in"],
          position: "right" as const,
        }}
        calculateMetadata={({ props }) => ({ durationInFrames: sideNotesDuration(props as any) })}
      />
      <Composition
        id="IconPop"
        component={withStage(IconPop, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={iconPopDuration({} as any)}
        defaultProps={{ emoji: "💡", label: "The unlock", position: "top-right" as const }}
        calculateMetadata={({ props }) => ({ durationInFrames: iconPopDuration(props as any) })}
      />
      <Composition
        id="NumberPop"
        component={withStage(NumberPop, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={numberPopDuration({} as any)}
        defaultProps={{ value: "₹1,499", label: "launch price", position: "right" as const, tone: "accent" as const }}
        calculateMetadata={({ props }) => ({ durationInFrames: numberPopDuration(props as any) })}
      />
      <Composition
        id="TitleStrap"
        component={withStage(TitleStrap, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={titleStrapDuration({} as any)}
        defaultProps={{ kicker: "Part 2", title: "What's actually inside" }}
        calculateMetadata={({ props }) => ({ durationInFrames: titleStrapDuration(props as any) })}
      />
      <Composition
        id="StepTracker"
        component={withStage(StepTracker, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={stepTrackerDuration({} as any)}
        defaultProps={{ step: 2, total: 5, label: "Validate the idea", position: "top-left" as const }}
        calculateMetadata={({ props }) => ({ durationInFrames: stepTrackerDuration(props as any) })}
      />
      <Composition
        id="HighlightRing"
        component={withStage(HighlightRing, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={highlightRingDuration()}
        defaultProps={{ x: 560, y: 250, w: 800, h: 560, label: "This number" }}
      />
      <Composition
        id="StampBadge"
        component={withStage(StampBadge, { overlay: true })}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={stampBadgeDuration({} as any)}
        defaultProps={{ text: "Sold out", tone: "danger" as const, position: "center" as const }}
        calculateMetadata={({ props }) => ({ durationInFrames: stampBadgeDuration(props as any) })}
      />
      <Composition
        id="LogoBill"
        component={withStage(LogoBill)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={logoBillDuration({ rows: new Array(4).fill({ label: "x", logos: [] }) } as any)}
        defaultProps={{ rows: [ { label: "AI platform", logos: ["openai", "claude"] }, { label: "Hosting", logos: ["vercel"] } ] }}
        calculateMetadata={({ props }) => ({ durationInFrames: logoBillDuration(props as any) })}
      />
      <Composition
        id="FootageStatement"
        component={withStage(FootageStatement)}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={footageStatementDuration({ lines: ["x", "y"] } as any)}
        defaultProps={{ src: "footage/mk-43266.mp4", lines: ["We all want to", "speak better English."], emphasis: "English" }}
        calculateMetadata={({ props }) => ({ durationInFrames: footageStatementDuration(props as any) })}
      />
      <Composition id="StackTable" component={withStage(StackTable)} fps={FPS} width={W} height={H}
        durationInFrames={stackTableDuration({ mode: "cost", rows: new Array(5).fill({ need: "x" }) } as any)}
        defaultProps={{ mode: "cost" as const, rows: [ { need: "AI API", icon: "sparkles", cost: 1700 }, { need: "Hosting", icon: "globe", cost: 1700 } ] }}
        calculateMetadata={({ props }) => ({ durationInFrames: stackTableDuration(props as any) })} />
      <Composition id="ToolCard" component={withStage(ToolCard)} fps={FPS} width={W} height={H}
        durationInFrames={toolCardDuration({ points: [1, 2] } as any)}
        defaultProps={{ slug: "puter", name: "Puter", points: [ { text: "x" } ], shot: "shots/puter-dev-1600.png" }}
        calculateMetadata={({ props }) => ({ durationInFrames: toolCardDuration(props as any) })} />
      <Composition id="ScreenFrame" component={withStage(ScreenFrame)} fps={FPS} width={W} height={H}
        durationInFrames={screenFrameDuration({} as any)}
        defaultProps={{ shot: "shots/google-puter-1600.png", url: "google.com" }}
        calculateMetadata={({ props }) => ({ durationInFrames: screenFrameDuration(props as any) })} />
      <Composition id="PayFlow" component={withStage(PayFlow)} fps={FPS} width={W} height={H}
        durationInFrames={payFlowDuration({} as any)} defaultProps={{}}
        calculateMetadata={({ props }) => ({ durationInFrames: payFlowDuration(props as any) })} />
      <Composition id="WordCaption" component={withStage(WordCaption, { overlay: true })} fps={FPS} width={W} height={H}
        durationInFrames={wordCaptionDuration({ text: "a b c d" } as any)}
        defaultProps={{ text: "Nothing to manage. Nothing to pay.", emphasis: ["Nothing"] }}
        calculateMetadata={({ props }) => ({ durationInFrames: wordCaptionDuration(props as any) })} />
    </>
  );
};
