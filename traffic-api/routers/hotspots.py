from fastapi import APIRouter

from models.realtime import load_hotspots, get_hotspot_realtime, compute_realtime_severity

router = APIRouter()

_hotspots = load_hotspots()


@router.get("/hotspots")
def get_hotspots():
    result = []
    for h in _hotspots:
        entry = {**h}
        rt = get_hotspot_realtime(h)
        if rt:
            rt["severity"] = compute_realtime_severity(rt)
        entry["realtime"] = rt
        result.append(entry)
    return {"hotspots": result, "total": len(result)}


@router.get("/hotspots/realtime")
def get_hotspots_realtime():
    result = []
    for h in _hotspots:
        rt = get_hotspot_realtime(h)
        entry = {"id": h["id"], "name": h["name"], "realtime": rt}
        if rt:
            entry["severity"] = compute_realtime_severity(rt)
        result.append(entry)
    return {"hotspots": result}
