# INSIGHTS.md
## Three Things I Learned About LILA BLACK Using This Tool

---

## Insight 1 — LILA BLACK is Overwhelmingly PvE, Not PvP

### What Caught My Eye
When I looked at the event breakdown across all 796 matches and 89,104 events, the kill distribution was striking:

| Event | Count | % of Total |
|---|---|---|
| BotKill (human kills bot) | 2,415 | 2.71% |
| BotKilled (human killed by bot) | 700 | 0.79% |
| Kill (human kills human) | **3** | 0.003% |
| Killed (human killed by human) | **3** | 0.003% |
| KilledByStorm | 39 | 0.04% |
| Loot | 12,885 | 14.5% |

### The Concrete Evidence
Across 796 matches over 5 days with 339 unique players — only **3 human-vs-human kills** occurred. That's a kill rate of 0.003% of all events and roughly **1 PvP kill per 265 matches**. Meanwhile, players killed bots 2,415 times — 805x more frequently than they killed other humans.

### Why a Level Designer Should Care
The maps are being played almost entirely as PvE experiences. This has direct implications for map design:
- **Contested zones** (areas designed for PvP fights) may not be functioning as intended — players are avoiding or bypassing them
- **Bot spawn placement** is effectively the primary combat encounter; bot patrol routes and spawn density matter far more than traditional PvP chokepoint design
- The 3 human kills that DID happen should be mapped to understand if any map zone is accidentally enabling PvP

### Actionable Items
| Action | Metric to Track |
|---|---|
| Identify where the 3 PvP kills occurred — redesign or remove those chokepoints if unintentional | Human Kill rate per zone |
| Review bot spawn density — are players finding bot encounters satisfying? | BotKill / BotKilled ratio per map area |
| If PvP is a design goal, add incentive structures (high-value loot, objectives) in contested zones | PvP engagement rate per match |

---

## Insight 2 — Loot Clustering Reveals Unintended High-Value Zones

### What Caught My Eye
Using the heatmap overlay with Event Type filter set to "Loot", a clear spatial pattern emerges on AmbroseValley — loot pickups cluster heavily in 2-3 zones while large portions of the map show near-zero loot activity. The same player who collected 29 loot items in one match did so within a very tight pixel radius (~200px out of 1024px).

### The Concrete Evidence
- **12,885 total loot events** across all matches
- Single players routinely collect 20-30 loot items per match
- Loot events per match range from 5 to 89 — a 17x variance
- On Lockdown, loot events concentrate in the central corridor (pixel range ~250-400, 280-420) based on heatmap density

### Why a Level Designer Should Care
When loot clusters tightly, it tells you one of two things: either the loot spawn system is placing items too densely in specific zones, or players have discovered an optimal loot route and are ignoring other areas entirely. Both are problems:
- **Too dense:** Players get overpowered too early, reducing tension
- **Route exploitation:** Large map areas go unexplored, wasting design effort

### Actionable Items
| Action | Metric to Track |
|---|---|
| Redistribute loot spawns away from high-density clusters | Loot event spatial distribution (Gini coefficient per map) |
| Add loot to under-visited areas to draw players into unexplored zones | % of map area with at least 1 loot event per session |
| Introduce rare high-value items in low-traffic zones as incentive | Average player path coverage % per match |

---

## Insight 3 — Storm Deaths Are Rare But Spatially Predictable — The Storm May Be Too Forgiving

### What Caught My Eye
Only **39 KilledByStorm events** occurred across 796 matches — a rate of 0.05 storm deaths per match. Given that LILA BLACK is described as an extraction shooter where "a one-directional storm pushes across the map forcing players to move and extract," this number feels extremely low. The storm appears to be barely a threat.

### The Concrete Evidence
- 39 storm deaths across 89,104 total events = 0.04% of all events
- 796 matches, 339 unique players → average 0.049 storm deaths per match
- This means in roughly 95% of matches, zero players die to the storm
- Storm deaths that do occur cluster near map edges (visible on the heatmap as isolated purple dots near boundaries), suggesting players who die are those who ignored storm warnings entirely

### Why a Level Designer Should Care
The storm is a core gameplay mechanic designed to create urgency, force movement, and prevent camping. If it almost never kills anyone, it's failing its design purpose. Players may have discovered that the storm moves slowly enough or has a large enough safe zone that it can be safely ignored. This removes a key tension driver from the game loop.

### Actionable Items
| Action | Metric to Track |
|---|---|
| Increase storm speed or reduce safe zone size in later match phases | KilledByStorm rate per match (target: 1-2 per match) |
| Add audio/visual warning intensity tuning — players may not be tracking storm position | Storm death timing (early vs late match) |
| Analyze whether storm deaths cluster on specific maps — Lockdown's smaller size may handle this better than AmbroseValley | Storm death rate per map (AmbroseValley vs GrandRift vs Lockdown) |
| Consider storm damage ramp — slow initial damage that accelerates — to make the threat feel real without being unfair | Player extraction rate before storm closes |