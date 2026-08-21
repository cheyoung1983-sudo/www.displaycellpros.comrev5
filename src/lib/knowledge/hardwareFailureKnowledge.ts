// Grounding source for the Triage AI diagnostic routes. Every technical claim
// the model is allowed to make about backlight/charging circuit failures should
// trace back to a paragraph here — the FidelityService verification wrapper
// (src/lib/fidelityService.ts) checks generated text against this document.

export const HARDWARE_FAILURE_KNOWLEDGE = `
## Backlight Circuit Analysis

Component hierarchy, in order of failure likelihood (highest to lowest):

1. Backlight Filter ("the fuse"): a ferrite bead encased in ceramic, intended to suppress EMI
   noise and flicker. It acts as an intentional fuse, breaking continuity to protect the
   broader circuit during current spikes — most commonly from hot-plugging the LCD connector
   without disconnecting the battery first. Highest probability of failure. Symptom: total
   no-backlight with no continuity across the filter.
2. Backlight Diode: a directional semiconductor that regulates one-way current. Delicate and
   prone to failing (shorting to ground) when subjected to unregulated voltage spikes. Moderate
   probability of failure. Symptom: total no-backlight, short to ground.
3. LCD Connector: high-voltage lines at this connector are vulnerable to corrosion, visible as
   blackened or discolored pins. High probability given liquid exposure or connector wear.
   Diagnosis requires reflowing these joints or replacing the FPC connector before any IC-level
   rework is attempted.
4. Split Circuit (dual-backlight-circuit models, iPhone 6S and later): failure of one filter in
   a dual-circuit model presents as a half-dim screen (one side dark) rather than total failure.
   Model-dependent.
5. Inductor Coil: a wound spiral of wire that boosts input voltage to the 15-20V required by the
   display. Mechanically sturdy and waterproofed since the iPhone 3GS; only fails if liquid
   physically corrodes the base wire. Extremely low probability of failure — treat the coil as
   the last point of suspicion in backlight triage, not the first.

## Charging & Power Management (Tristar/U2)

The Tristar (U2) IC manages USB logic and the initial charging handshake.
- Earlier 1610A1 and 1610A2 IC variants are highly susceptible to failure under unregulated
  power. The 1610A3 variant is a more robust successor designed to withstand greater electrical
  abuse; replacement should target 1610A3 where available.
- Common failure trigger: car cigarette-lighter chargers, which supply unrefined power from the
  vehicle alternator without the regulation an OEM AC adapter provides. Uncertified third-party
  cables that fail to regulate current contribute to the same wear pattern.
- "Fake charging" symptom: the UI reports a charging state, but current draw reads ~0.00A on a
  5V rail — indicates a handshake failure between the charging IC and the negotiator chip rather
  than a dead battery.

### VDD_MAIN short-circuit triage sequence
1. Isolation: confirm the short is specifically on the VDD_MAIN rail while the Boost and Bat
   lines remain within spec — this narrows the fault to the primary power rail facing the
   charger rather than a downstream regulator.
2. Thermal check: use thermal imaging to look for a heat signature at the shorted component.
3. Voltage injection: if thermal imaging does not reveal the heat signature, inject voltage into
   VDD_MAIN test points and check for voltage drops on capacitors near the PMIC and baseband to
   pinpoint the exact failure site.

## Diagnostic reasoning method

Apply a structured chain-of-thought: state what telemetry is given, state the assumptions that
telemetry supports, and only then state a conclusion — do not jump directly from a symptom to a
component recommendation without walking through what the reading does and does not rule out.

## Abstention boundary

This diagnostic output is an expert-aid triage aid, not a final repair confirmation. Final
pricing and repair confirmation require physical verification via bench ammeter and diode-mode
measurement — always say so rather than presenting a diagnosis as bench-verified fact.
`.trim();
