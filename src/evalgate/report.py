from __future__ import annotations
from typing import Dict, Any, List

def render_markdown(result: Dict[str, Any]) -> str:
    # Show evaluator errors prominently in status
    evaluator_errors = result.get("evaluator_errors", [])
    if evaluator_errors:
        status = "❌ FAILED" if not result["gate"]["passed"] else "⚠️ RAN WITH ERRORS"
    else:
        status = "✅ PASSED" if result["gate"]["passed"] else "❌ FAILED"
    
    lines: List[str] = [
        f"### {status} ({result['overall']:.2f} overall)",
        "",
    ]
    
    # Show evaluator errors first and prominently
    if evaluator_errors:
        lines += ["**⚠️ Evaluator Errors**"]
        for error in evaluator_errors:
            lines.append(f"- {error}")
        lines.append("")
    
    lines.append("**Scores**")
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
        f"- allow_regression: {result['gate']['allow_regression']} → {'✅' if (result.get('regression_ok', True)) else '❌'}",
        f"- evaluators_ok: → {'✅' if result.get('evaluators_ok', True) else '❌'}",
    ]

    # Optional tables (e.g., confusion matrices)
    for table in result.get("tables", []):
        headers = table.get("headers", [])
        rows = table.get("rows", [])
        if not headers or not rows:
            continue
        lines += ["", f"**{table.get('title', 'Table')}**"]
        lines.append("| " + " | ".join(headers) + " |")
        lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
        for row in rows:
            lines.append("| " + " | ".join(str(x) for x in row) + " |")

    # Optional plots (links)
    for plot in result.get("plots", []):
        url = plot.get("url")
        title = plot.get("title", "plot")
        if url:
            lines += ["", f"![{title}]({url})"]

    return "\n".join(lines)
