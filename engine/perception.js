export class PerceptionEngine {
    constructor(data) {
        if (!data) throw new Error("PerceptionEngine requires initial data payload.");
        this.zones = data.zones || [];
        this.stalls = data.stalls || [];
        this.routes = data.routes || [];
        this.lastUpdate = data.timestamp;
    }

    // Hot-update the spatial representation based on Firebase or Websocket stream.
    updateState(newData) {
        if(newData.zones) this.zones = newData.zones;
        if(newData.stalls) this.stalls = newData.stalls;
        this.lastUpdate = new Date().toISOString();
    }

    getZone(zoneId) {
        return this.zones.find(z => z.id === zoneId) || null;
    }

    getStallsByCategory(category) {
        return this.stalls.filter(s => s.category === category) || [];
    }
    
    getAvailableRoutes(startZoneId) {
        // Automatically inject bi-directional routing constraints for spatial graphs
        return this.routes.map(r => {
            if (r.start === startZoneId) return r;
            if (r.end === startZoneId) return { ...r, start: r.end, end: r.start, zones_crossed: [...r.zones_crossed].reverse() };
            return null;
        }).filter(r => r !== null);
    }
    
    getAllExits() {
        return this.zones.filter(z => z.type === 'exit');
    }
}
