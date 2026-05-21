import { calculateRiskScore, getCoordinationLabel } from './utils.js';

export class DecisionEngine {
    constructor(perceptionEngine, predictionEngine) {
        this.perception = perceptionEngine;
        this.prediction = predictionEngine;
    }

    calculateEfficiencyScore(distance, averageDensity) {
        const normalizedDist = Math.min(1.0, distance / 1000);
        return Number(((1.0 - normalizedDist) * 0.4 + (1.0 - averageDensity) * 0.6).toFixed(2));
    }
    
    computeCoordinationScore() {
        const zones = this.perception.zones;
        if (zones.length === 0) return 0;
        const avg = this.getGlobalAvgDensity();
        const variance = zones.reduce((s, z) => s + Math.pow(z.current_density - avg, 2), 0) / zones.length;
        return Math.min(100, Math.max(0, Math.round((1 - variance) * 100)));
    }

    getGlobalAvgDensity() {
        const zones = this.perception.zones;
        return zones.reduce((s, z) => s + z.current_density, 0) / zones.length;
    }

    findSafestExit(currentZoneId) {
        const currentZone = this.perception.getZone(currentZoneId);
        if (!currentZone) return this.generateFallbackOutput("Location invalid or GPS disconnected.");

        const possibleRoutes = this.perception.getAvailableRoutes(currentZoneId);
        const exits = this.perception.getAllExits().map(e => e.id);
        const exitRoutes = possibleRoutes.filter(r => exits.includes(r.end));

        if (exitRoutes.length === 0) return this.generateFallbackOutput("No physical paths to any exit detected.");

        let bestRoute = null;
        let bestEffScore = -1;
        let bestAnalysis = null;

        exitRoutes.forEach(r => {
            const analysis = this.prediction.analyzeRoute(r, this.perception); // uses static prediction fallback if undefined
            const target = this.perception.getZone(r.end);
            
            // PREDICTIVE LOGIC: use future density
            const futureTargetDensity = target.future_density !== undefined ? target.future_density : analysis.avgDensity;
            
            const effScore = this.calculateEfficiencyScore(r.distance_m, futureTargetDensity);
            const surgePenalty = futureTargetDensity > 0.8 ? 0.2 : 1;
            const penalizedScore = effScore * surgePenalty;

            if (penalizedScore > bestEffScore) {
                bestEffScore = penalizedScore;
                bestRoute = r;
                bestAnalysis = { ...analysis, avgDensity: futureTargetDensity };
            }
        });

        const targetExit = bestRoute ? this.perception.getZone(bestRoute.end) : null;
        const coordScore = this.computeCoordinationScore();
        const estimatedWalkTime = Math.ceil(bestRoute.distance_m / 80); 
        
        // WAIT vs MOVE Intelligence
        let waitOrMoveAction;
        let explanationMsg;
        const futureTrend = currentZone.future_density - currentZone.current_density;
        const isClearing = futureTrend < -0.05;

        if (isClearing && currentZone.current_density < 0.6) {
            waitOrMoveAction = `🚀 FINAL DECISION: WAIT\n⏱ Wait 2 minutes. Congestion predicted to drop significantly before moving to ${targetExit?.name}`;
        } else {
            waitOrMoveAction = `🚀 FINAL DECISION: MOVE\n➡ Move immediately towards ${targetExit?.name} before congestion spike`;
        }
        
        explanationMsg = `Predicted congestion at alternative routes will exceed ${Math.round(bestAnalysis.avgDensity * 100)}% within 2–3 minutes. Current route maintains optimal flow and minimizes bottleneck exposure.`;

        const overloadedZones = this.perception.zones.filter(z => z.current_density > 0.85);
        if (overloadedZones.length > 2) {
            explanationMsg += ` ⚠ SYSTEM ALERT: Multiple zones exceeding safe capacity. Auto-redistribution active.`;
        }
        
        const predictiveRisk = calculateRiskScore(Math.max(bestAnalysis.maxRisk, bestAnalysis.avgDensity));
        const coordLabel = getCoordinationLabel(coordScore || 0);

        return {
            OUTPUT: {
                recommended_action: waitOrMoveAction,
                estimated_time: estimatedWalkTime,
                metrics: {
                    risk_score: predictiveRisk,
                    congestion_index: Math.round(bestAnalysis.avgDensity * 100),
                    route_efficiency_score: Number(bestEffScore.toFixed(2)),
                    coordination_score: coordScore || 0,
                    coordination_label: coordLabel
                },
                explanation: explanationMsg
            },
            _payload: { route: bestRoute, destination: targetExit }
        };
    }

    findBestAmenity(currentZoneId, category = 'food', prioritizeWait = false) {
        const currentZone = this.perception.getZone(currentZoneId);
        if (!currentZone) return this.generateFallbackOutput("Location context disconnected.");

        const stalls = this.perception.getStallsByCategory(category);
        if (stalls.length === 0) return this.generateFallbackOutput("Amenities missing from topological grid.");

        let bestStall = null;
        let bestEffScore = -1;
        let finalAnalysis = null;
        let finalRoute = null;

        stalls.forEach(stall => {
            let routeAnalysis = { avgDensity: 0, maxRisk: 0, totalGrowth: 0 };
            let route = null;
            let dist = 0;

            if (stall.zone !== currentZoneId) {
                const possibleRoutes = this.perception.getAvailableRoutes(currentZoneId)
                    .filter(r => r.end === stall.zone);
                if (possibleRoutes.length > 0) {
                    route = possibleRoutes.reduce((min, r) => r.distance_m < min.distance_m ? r : min);
                    routeAnalysis = this.prediction.analyzeRoute(route, this.perception);
                    
                    const tgt = this.perception.getZone(stall.zone);
                    if (tgt && tgt.future_density) routeAnalysis.avgDensity = tgt.future_density;
                    
                    dist = route.distance_m;
                } else return; 
            } else {
                 const zoneInfo = this.perception.getZone(stall.zone);
                 // use deterministic future density if bound from simulation
                 const futureDens = zoneInfo.future_density !== undefined ? zoneInfo.future_density : this.prediction.predictDensity(zoneInfo).futureDensity;
                 const metrics = this.prediction.getQuantitativeMetrics(futureDens);
                 routeAnalysis = { avgDensity: futureDens, maxRisk: metrics.risk_score, totalGrowth: 0 };
            }

            const routeEff = this.calculateEfficiencyScore(dist, routeAnalysis.avgDensity);
            const waitTimePenalty = Math.min(1.0, stall.wait_time_mins / 60);
            
            const w1 = prioritizeWait ? 0.3 : 0.7;
            const w2 = prioritizeWait ? 0.7 : 0.3;

            const stallEffScore = Number((routeEff * w1 + (1.0 - waitTimePenalty) * w2).toFixed(2));
            const surgePenalty = routeAnalysis.avgDensity > 0.8 ? 0.2 : 1;
            const penalizedScore = stallEffScore * surgePenalty;

            if (penalizedScore > bestEffScore) {
                bestEffScore = penalizedScore;
                bestStall = stall;
                finalAnalysis = routeAnalysis;
                finalRoute = route;
            }
        });

        if (!bestStall) return this.generateFallbackOutput("No reachable trajectory to target.");

        const traverseTime = finalRoute ? Math.ceil(finalRoute.distance_m / 80) : 0;
        const totalTime = traverseTime + bestStall.wait_time_mins;
        const coordScore = this.computeCoordinationScore();

        let waitOrMoveAction;
        let explanationMsg;
        const futureTrend = currentZone.future_density - currentZone.current_density;
        const isClearing = futureTrend < -0.05;

        if (isClearing && currentZone.current_density < 0.6) {
             waitOrMoveAction = `🚀 FINAL DECISION: WAIT\n⏱ Wait 2 minutes. Congestion predicted to drop significantly before moving to ${bestStall?.name}`;
        } else {
             waitOrMoveAction = `🚀 FINAL DECISION: MOVE\n➡ Move immediately towards ${bestStall?.name} before congestion spike`;
        }

        explanationMsg = `Predicted congestion at alternative routes will exceed ${Math.round(finalAnalysis.avgDensity * 100)}% within 2–3 minutes. Current route maintains optimal flow and minimizes bottleneck exposure.`;
        
        const overloadedZones = this.perception.zones.filter(z => z.current_density > 0.85);
        if (overloadedZones.length > 2) {
            explanationMsg += ` ⚠ SYSTEM ALERT: Multiple zones exceeding safe capacity. Auto-redistribution active.`;
        }

        const predictiveRisk = calculateRiskScore(Math.max(finalAnalysis.maxRisk, finalAnalysis.avgDensity));
        const coordLabel = getCoordinationLabel(coordScore || 0);

        return {
            OUTPUT: {
                recommended_action: waitOrMoveAction,
                estimated_time: totalTime,
                metrics: {
                   risk_score: predictiveRisk,
                   congestion_index: Math.round(finalAnalysis.avgDensity * 100),
                   route_efficiency_score: Number(bestEffScore.toFixed(2)),
                   coordination_score: coordScore || 0,
                   coordination_label: coordLabel
                },
                explanation: explanationMsg
            },
            _payload: { route: finalRoute, destination: bestStall }
        };
    }
    
    optimizeWaitTime(currentZoneId) {
        // Uses amenity search but heavily penalizes wait time to fix the "wait" intent
        return this.findBestAmenity(currentZoneId, 'food', true);
    }
    
    analyzeCrowds() {
        const zones = this.perception.zones;
        // Sort highest density
        const crowdedList = [...zones].sort((a,b) => b.current_density - a.current_density).slice(0,3);
        const globalAvg = this.getGlobalAvgDensity();
        const riskLevel = crowdedList[0].current_density > 0.85 ? 0.9 : 0.5;

        return {
            OUTPUT: {
                recommended_action: `Monitor Zones: ${crowdedList.map(z => z.name).join(', ')}`,
                estimated_time: 0,
                metrics: {
                   risk_score: riskLevel,
                   congestion_index: Math.round(crowdedList[0].current_density * 100),
                   route_efficiency_score: 0,
                   coordination_score: Math.round((1.0 - globalAvg)*100)
                },
                explanation: `Analysis Complete: Detected ${crowdedList.length} major spatial blockades. Applying automated preventative redirects away from these areas.`
            },
            _payload: { highlights: crowdedList }
        };
    }
    
    recommendOptimumMovement(currentZoneId) {
        const currentZone = this.perception.getZone(currentZoneId);
        if (!currentZone) return this.generateFallbackOutput("Tracking interrupted.");

        const possibleRoutes = this.perception.getAvailableRoutes(currentZoneId);
        if (possibleRoutes.length === 0) return this.generateFallbackOutput("Architectural trap: no outbound routes.");

        let bestRoute = null;
        let bestEffScore = -1;
        let bestAnalysis = null;

        possibleRoutes.forEach(r => {
             const analysis = this.prediction.analyzeRoute(r, this.perception);
             const target = this.perception.getZone(r.end);
             const futureTargetDensity = target.future_density !== undefined ? target.future_density : analysis.avgDensity;

             const effScore = this.calculateEfficiencyScore(r.distance_m, futureTargetDensity);
             const surgePenalty = futureTargetDensity > 0.8 ? 0.2 : 1;
             const penalizedScore = effScore * surgePenalty;

             if (penalizedScore > bestEffScore) {
                 bestEffScore = penalizedScore;
                 bestRoute = r;
                 bestAnalysis = { ...analysis, avgDensity: futureTargetDensity };
             }
        });

        if (!bestRoute) return this.generateFallbackOutput("No movement advised. All bounding routes surpass fatal safety thresholds.");

        const targetNode = this.perception.getZone(bestRoute.end);
        
        let waitOrMoveAction;
        let explanationMsg;
        const futureTrend = currentZone.future_density - currentZone.current_density;
        const isClearing = futureTrend < -0.05;

        if (isClearing && currentZone.current_density < 0.6) {
             waitOrMoveAction = `🚀 FINAL DECISION: WAIT\n⏱ Wait 2 minutes. Congestion predicted to drop significantly before moving to ${targetNode?.name}`;
        } else {
             waitOrMoveAction = `🚀 FINAL DECISION: MOVE\n➡ Move immediately towards ${targetNode?.name} before congestion spike`;
        }
        
        explanationMsg = `Predicted congestion at alternative routes will exceed ${Math.round(bestAnalysis.avgDensity * 100)}% within 2–3 minutes. Current route maintains optimal flow and minimizes bottleneck exposure.`;

        const overloadedZones = this.perception.zones.filter(z => z.current_density > 0.85);
        if (overloadedZones.length > 2) {
            explanationMsg += ` ⚠ SYSTEM ALERT: Multiple zones exceeding safe capacity. Auto-redistribution active.`;
        }

        const predictiveRisk = calculateRiskScore(Math.max(bestAnalysis.maxRisk, bestAnalysis.avgDensity));
        const coordScore = this.computeCoordinationScore();
        const coordLabel = getCoordinationLabel(coordScore || 0);

        return {
            OUTPUT: {
                recommended_action: waitOrMoveAction,
                estimated_time: Math.ceil(bestRoute.distance_m / 80),
                metrics: {
                   risk_score: predictiveRisk,
                   congestion_index: Math.round(bestAnalysis.avgDensity * 100),
                   route_efficiency_score: Number(bestEffScore.toFixed(2)),
                   coordination_score: coordScore || 0,
                   coordination_label: coordLabel
                },
                explanation: explanationMsg
            },
            _payload: { route: bestRoute, destination: targetNode }
        };
    }

    generateFallbackOutput(errorReason) {
        return {
            OUTPUT: {
                recommended_action: "Remain at current location",
                estimated_time: 0,
                metrics: { risk_score: 0.9, congestion_index: 100, route_efficiency_score: 0, coordination_score: 0, coordination_label: "Fallback" },
                explanation: `Action safely aborted. System fallback initialized isolating node matrix.`
            },
            _payload: null
        };
    }
}
