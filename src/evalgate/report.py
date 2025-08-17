from __future__ import annotations
from typing import Dict, Any, List

def render_markdown(result: Dict[str, Any]) -> str:
    status = "✅ PASSED" if result["gate"]["passed"] else "❌ FAILED"
    lines: List[str] = [
        f"### {status} ({result['overall']:.2f} overall)",
        "",
        "**Scores**",
    ]
    for item in result["scores"]:
        delta = item.get("delta")
        delta_str = f" ({delta:+.2f} vs main)" if delta is not None else ""
        lines.append(f"- {item['name']}: {item['score']:.2f}{delta_str}")
    if result.get("latency") is not None and result.get("cost") is not None:
        lines.append(f"- Latency/Cost: p95 {int(result['latency'])}ms / ${result['cost']:.3f}")
    lines += ["", f"**Failures ({len(result['failures'])})**"]
    for f in result["failures"][:20]:
        lines.append(f"- {f}")
    if len(result["failures"]) > 20:
        lines.append(f"- … +{len(result['failures'])-20} more")
    lines += [
        "",
        "**Gate**",
        f"- min_overall_score: {result['gate']['min_overall_score']} → {'✅' if result['overall'] >= result['gate']['min_overall_score'] else '❌'}",
        f"- allow_regression: {result['gate']['allow_regression']} → {'✅' if (result['regression_ok']) else '❌'}",
        "",
        f"Artifacts: `{result['artifact_path']}`",
    ]
    return "\n".join(lines)
