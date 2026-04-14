---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - docs/traffic-map-poc-search-routing-design.md
  - docs/traffic-map-poc-viewport-rendering-solution.md
  - docs/smartroute-heatmap-integration.md
  - docs/smartroute-full-hcmc-heatmap.md
---

# UX Design Specification webdev-vong-2

**Author:** Admin
**Date:** 2026-04-15

---

## Executive Summary

### Project Vision

SmartRoute is a **predictive traffic PoC for Ho Chi Minh City** that visualizes ~10,000 road segments with simulated Level of Service (A–F) predictions. It is not a full navigation app — it is a proof-of-concept designed to answer one question clearly: **"When should I leave, which way should I go, and how bad will it be?"**

The product sits between a static traffic map and a turn-by-turn navigator. Its unique value is **predicted congestion** — showing users what traffic will look like 15, 30, or 60 minutes from now, not just what it looks like right now.

The current phase targets **internal demo and evaluator audiences**. UX success is measured not by visual polish alone, but by whether evaluators can answer three questions after using the app:

1. **"Is this prediction good or bad?"** — Can the user judge prediction quality and confidence?
2. **"When should I go?"** — Is the departure timing insight clear and actionable?
3. **"Why is this different from Google Maps?"** — Does the user understand the predictive advantage over a standard traffic map?

### Target Users

**Primary (current phase): Internal demo / evaluators**
- Product stakeholders, thesis advisors, technical reviewers
- Evaluating whether the prediction approach has merit
- Need to quickly grasp what the app does differently and whether the predictions are credible
- Desktop-first, but the interface should not look like it *only* works on desktop

**Secondary (near future): Limited real-user feedback**
- HCMC commuters testing the app in controlled settings
- Vietnamese-speaking, varying tech-savviness
- Will use the app before leaving, not during driving
- Mobile-aware responsive design from day one

**User mindset:** "I have to cross the city. I know it's going to be bad. Help me decide *when* to leave and *which way* to go."

### Key Design Challenges

1. **Making prediction value legible.** The app shows predicted LOS on segments, but a user looking at a map full of colored lines doesn't automatically understand *what the prediction means*, *how confident it is*, or *what action to take*. The UX must bridge the gap between "here's data" and "here's what you should do."

2. **Map readability at scale.** With 10,000 segments across full HCMC, the map can feel overwhelming at city-level zoom and sparse at street-level zoom. The current zoom-based density control solves the *performance* problem, but the *visual hierarchy* problem remains — users need to instantly see what matters (the bad spots) without being drowned in color noise.

3. **Route + predicted traffic integration.** When a user plans a route, they need to understand not just "here's the route" but "here's how bad traffic will be along this route at the time you plan to travel." The route summary must connect prediction data to the specific route, not just show them side by side.

4. **Escaping the developer-dashboard feel.** The current UI shows segment counts, zoom levels, behavior descriptions, and detail-layer status — all useful for debugging, all distracting for an evaluator trying to judge product value. The interface needs to feel like a *product*, not a *tech demo panel*.

### Design Opportunities

1. **Predictive timing as a first-class feature.** No mainstream map app in Vietnam clearly answers "leave now vs. leave in 30 minutes — here's the difference." Making this comparison visible and intuitive could be the single most compelling UX differentiator.

2. **Traffic storytelling, not just traffic display.** Instead of showing a wall of colored segments, guide the user's attention: "This route has 3 congestion hotspots. The worst is at Nguyen Huu Canh in 30 minutes. Consider leaving before 7:15." Narrative summaries could make the prediction feel trustworthy and actionable.

3. **Route quality visualization.** Rather than just coloring segments on the route, show the *quality* of the predicted route — is it confidently clear, or are there uncertain zones? This directly addresses the evaluator question "is this prediction good or bad?"

4. **Progressive disclosure for complexity.** The app has rich data (LOS distribution, congested streets, confidence levels) but doesn't need to show it all at once. Layer it: overview first, detail on demand. This supports both the casual evaluator and the technical reviewer.

## Core User Experience

### Defining Experience

The core loop of SmartRoute is **"check before you leave."** A user opens the app, looks at a familiar area or route, compares what traffic looks like now vs. 30 minutes from now, and makes a departure decision.

This is not an explore-the-map experience. It is a **decision-making experience**. The map is the canvas, but the outcome the user needs is a decision: *go now, go later, take a different route.*

The single most important interaction is **route + prediction comparison over time**. When a user can see "leave at 7:30 = 35 min, leave at 8:00 = 52 min" — that's the moment they understand why this product exists. Everything else serves that moment.

**The golden rule:** UX never stops at "here is the prediction data." UX always drives toward "here is what you should do with this prediction." Every screen, every component, every piece of information should answer: *what action does the user take because of this?*

### Platform Strategy

- **Desktop-first** for the current PoC phase (internal demo, evaluator presentations)
- **Mobile-aware responsive design** from day one — the interface must not assume a large screen, even if desktop is the primary target
- **Mouse + keyboard** primary input, but touch targets should meet minimum size requirements (44px) for future mobile use
- **No offline requirement** at this phase — always-online, viewport-based data fetching
- **Single-page app experience** — the map is always visible, all controls overlay the map, no page navigation

### Effortless Interactions

1. **Identifying the worst congestion — zero effort.** The user should not need to scan thousands of colored segments to find the bad spots. The interface should surface "here's where it's bad" proactively — through visual hierarchy (bad zones pop, good zones recede), summary callouts, or highlighted hotspots.

2. **Time comparison — instant and intuitive.** Switching between now/+15/+30/+60 should feel like watching a time-lapse, not like loading a new page. The change must be visually obvious and meaningful — the user should immediately see "oh, it gets worse in 30 minutes" without reading any text.

3. **Route quality at a glance.** When a route is displayed, the user should understand its quality in under 2 seconds. Not "here's a blue line on a map with colored segments nearby" but "this route has 2 congestion zones, the worst is LOS E, total predicted time is 42 minutes."

4. **Search to route — seamless flow.** From "I want to go to Ben Thanh" to "here's your route with predictions" should be fewer than 4 interactions. No mode switching confusion, no unclear states.

### Critical Success Moments

1. **The "aha" moment:** User switches the time picker from "now" to "+30 min" and sees the map visually shift — a clear corridor turns red, their planned route gets noticeably worse. *That* is when they understand "this is not just a traffic map, this predicts the future." If this moment doesn't land, the product pitch fails.

2. **The trust moment:** User sees a prediction that matches their real-world experience. "Yes, Nguyen Van Linh really does get bad at 5:30pm." This builds credibility for the prediction model. If the predictions look random or wrong, trust evaporates immediately.

3. **The action moment:** User changes their departure time or route based on what the app shows. This is the ultimate success — the prediction influenced behavior. The UI must make it obvious *what to change* (leave earlier, take a different road).

4. **The failure point — information overload.** If the user opens the app and sees a wall of colored lines with no clear message, the experience fails at the first screen. Progressive disclosure is critical: lead with the insight, reveal the data on demand.

### Experience Principles

1. **Action over data.** Every piece of information should serve a decision. If a UI element doesn't help the user answer "what should I do?", it doesn't belong on the main screen.

2. **Prediction is the product.** The map is infrastructure. The search is infrastructure. The *prediction* — showing what traffic will be like in the future — is the product. Design decisions should always highlight the predictive element, not just the traffic display.

3. **Reduce to reveal.** Don't show everything at once. Hide developer-facing metrics (segment counts, zoom levels, layer status). Use progressive disclosure: show the insight first, let the user dig for the data. The current "Behavior" panel is the anti-pattern — it explains the system instead of serving the user.

4. **Visual hierarchy mirrors importance.** Bad traffic should visually dominate. Good traffic should recede. The user's route should be prominent. Background segments should be subtle. The current uniform rendering treats every segment equally — that's the performance-correct but UX-incorrect approach.
