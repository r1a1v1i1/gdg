export class PredictionEngine {
    constructor() {}

    predictDensity(zone) {
        // Validation / Error Fallback processing
        if (!zone || typeof zone.capacity !== 'number' || zone.capacity <= 0) return { futureDensity: 0, growthRate: 0 };
        
        // Zero flow handling
        const currentDensity = Math.max(0, zone.current_density || 0);
        const inFlow = isNaN(zone.incoming_flow) ? 0 : zone.incoming_flow;
        const outFlow = isNaN(zone.outgoing_flow) ? 0 : zone.outgoing_flow;

        // FORMULA: growth_rate = (incoming_flow - outgoing_flow)
        const growthRate = inFlow - outFlow;
        
        // FORMULA: future_density = current_density + (growth_rate / capacity)
        // Note: Density is a ratio 0.0 -> 1.0, so people growth affects capacity base
        const predictedPeople = (currentDensity * zone.capacity) + growthRate;
        const futureDensity = Math.min(1.0, Math.max(0, predictedPeople / zone.capacity));

        return {
            futureDensity: Number(futureDensity.toFixed(2)),
            growthRate: growthRate,
            currentDensity: currentDensity
        };
    }

    getQuantitativeMetrics(futureDensity) {
        // risk_score calculation (0-1)
        let riskScore = 0;
        if (futureDensity >= 0.85) riskScore = 0.9;
        else if (futureDensity >= 0.6) riskScore = 0.5;
        else riskScore = 0.1;

        return {
            risk_score: riskScore,
            congestion_index: Math.round(futureDensity * 100)
        };
    }

    analyzeRoute(route, perceptionEngine) {
        // Edge Case: Invalid path
        if (!route || !route.zones_crossed) return { avgDensity: 0, maxRisk: 0, totalGrowth: 0 };

        const zones = route.zones_crossed.map(id => perceptionEngine.getZone(id)).filter(z => !!z);
        if (zones.length === 0) return { avgDensity: 0, maxRisk: 0, totalGrowth: 0 };

        let totalDensity = 0;
        let maxRisk = 0;
        let totalGrowth = 0;

        zones.forEach(z => {
            const pred = this.predictDensity(z);
            const metrics = this.getQuantitativeMetrics(pred.futureDensity);
            
            totalDensity += pred.futureDensity;
            totalGrowth += pred.growthRate;
            if (metrics.risk_score > maxRisk) maxRisk = metrics.risk_score;
        });

        return {
            avgDensity: Number((totalDensity / zones.length).toFixed(2)),
            maxRisk: maxRisk,
            totalGrowth: totalGrowth
        };
    }
}
