import { getDatabase, ref, set } from "firebase/database";

export function logToFirebase(data) {
    try {
        const db = getDatabase();
        set(ref(db, 'crowdLogs/' + Date.now()), data);
    } catch (e) {
        // Fallback for missing init in local test mode
        console.log("Firebase sync intercepted", data.length);
    }
}
