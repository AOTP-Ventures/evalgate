from __future__ import annotations
import os
import json
import re
from typing import Dict, Any, List, Tuple, Optional
from pathlib import Path

from .base import register
from .. import cache


def _load_prompt_template(prompt_path: str) -> str:
    """Load prompt template from file."""
    try:
        return Path(prompt_path).read_text(encoding="utf-8").strip()
    except Exception as e:
        raise ValueError(f"Failed to load prompt template from {prompt_path}: {e}")


def _format_prompt(template: str, input_data: Dict[str, Any], output_data: Dict[str, Any], 
                   expected_data: Optional[Dict[str, Any]] = None) -> str:
    """Format prompt template with input, output, and expected data."""
    context = {
        "input": json.dumps(input_data, indent=2),
        "output": json.dumps(output_data, indent=2),
        "expected": json.dumps(expected_data or {}, indent=2)
    }
    
    # Simple template substitution
    formatted = template
    for key, value in context.items():
        formatted = formatted.replace(f"{{{key}}}", str(value))
        formatted = formatted.replace(f"{{{{{key}}}}}", str(value))
    
    return formatted


def _extract_score_from_response(response: str) -> float:
    """Extract numerical score from LLM response.
    
    Looks for patterns like:
    - Score: 0.85
    - Rating: 4/5
    - 8.5/10
    - 85%
    """
    response = response.strip().lower()
    
    # Pattern 1: Score: X.XX or Score X.XX
    score_match = re.search(r'score:?\s*([0-9]*\.?[0-9]+)', response)
    if score_match:
        score = float(score_match.group(1))
        # Assume scores > 1 are out of 10, normalize to 0-1
        return min(score / 10 if score > 1 else score, 1.0)
    
    # Pattern 2: X/Y format (e.g., 4/5, 8.5/10)
    fraction_match = re.search(r'([0-9]*\.?[0-9]+)/([0-9]*\.?[0-9]+)', response)
    if fraction_match:
        numerator = float(fraction_match.group(1))
        denominator = float(fraction_match.group(2))
        return min(numerator / denominator, 1.0)
    
    # Pattern 3: Percentage (85%)
    percent_match = re.search(r'([0-9]*\.?[0-9]+)%', response)
    if percent_match:
        return min(float(percent_match.group(1)) / 100, 1.0)
    
    # Pattern 4: Just a number at the start/end of response
    number_match = re.search(r'([0-9]*\.?[0-9]+)', response)
    if number_match:
        score = float(number_match.group(1))
        # Assume scores > 1 are out of 10
        return min(score / 10 if score > 1 else score, 1.0)
    
    # Default: try to parse sentiment
    if any(word in response for word in ['excellent', 'perfect', 'outstanding']):
        return 1.0
    elif any(word in response for word in ['good', 'solid', 'satisfactory']):
        return 0.8
    elif any(word in response for word in ['fair', 'adequate', 'okay']):
        return 0.6
    elif any(word in response for word in ['poor', 'inadequate', 'unsatisfactory']):
        return 0.4
    elif any(word in response for word in ['terrible', 'awful', 'unacceptable']):
        return 0.2
    
    # Default fallback
    return 0.5


def _call_openai(model: str, prompt: str, api_key: str, temperature: float = 0.1, 
                 max_tokens: int = 1000, base_url: Optional[str] = None) -> str:
    """Call OpenAI API."""
    try:
        import openai
    except ImportError:
        raise ImportError("openai package required for OpenAI provider. Install with: pip install openai")
    
    client = openai.OpenAI(api_key=api_key, base_url=base_url)
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        raise RuntimeError(f"OpenAI API call failed: {e}")


def _call_anthropic(model: str, prompt: str, api_key: str, temperature: float = 0.1,
                    max_tokens: int = 1000) -> str:
    """Call Anthropic API."""
    try:
        import anthropic
    except ImportError:
        raise ImportError("anthropic package required for Anthropic provider. Install with: pip install anthropic")
    
    client = anthropic.Anthropic(api_key=api_key)
    
    try:
        response = client.messages.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.content[0].text if response.content else ""
    except Exception as e:
        raise RuntimeError(f"Anthropic API call failed: {e}")


def _call_azure(model: str, prompt: str, api_key: str, temperature: float = 0.1,
                max_tokens: int = 1000, base_url: Optional[str] = None) -> str:
    """Call Azure OpenAI API."""
    try:
        import openai
    except ImportError:
        raise ImportError("openai package required for Azure provider. Install with: pip install openai")
    
    if not base_url:
        raise ValueError("base_url required for Azure provider")
    
    client = openai.AzureOpenAI(
        api_key=api_key,
        azure_endpoint=base_url,
        api_version="2024-02-15-preview"
    )
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        raise RuntimeError(f"Azure API call failed: {e}")


def _call_local(model: str, prompt: str, temperature: float = 0.1,
                max_tokens: int = 1000, base_url: Optional[str] = None) -> str:
    """Call local LLM endpoint (OpenAI-compatible)."""
    try:
        import openai
    except ImportError:
        raise ImportError("openai package required for local provider. Install with: pip install openai")
    
    if not base_url:
        raise ValueError("base_url required for local provider")
    
    client = openai.OpenAI(
        api_key="dummy",  # Local endpoints typically don't need real API keys
        base_url=base_url
    )
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        raise RuntimeError(f"Local API call failed: {e}")


def evaluate(outputs: Dict[str, Dict[str, Any]], 
             fixtures: Dict[str, Dict[str, Any]],
             provider: str,
             model: str,
             prompt_path: str,
             api_key_env_var: Optional[str] = None,
             base_url: Optional[str] = None,
             temperature: float = 0.1,
             max_tokens: int = 1000) -> Tuple[float, List[str]]:
    """
    Evaluate outputs using an LLM as judge.
    
    Args:
        outputs: Generated outputs to evaluate
        fixtures: Input fixtures with expected data
        provider: LLM provider ("openai", "anthropic", "azure", "local")
        model: Model name/ID
        prompt_path: Path to prompt template file
        api_key_env_var: Environment variable name containing API key
        base_url: Base URL for API (required for Azure/local)
        temperature: Sampling temperature
        max_tokens: Maximum response tokens
    
    Returns:
        Tuple of (average_score, list_of_detailed_results)
    """
    if not outputs:
        return 1.0, []
    
    # Load prompt template
    prompt_template = _load_prompt_template(prompt_path)
    
    # Get API key from environment if specified
    api_key = None
    if api_key_env_var:
        api_key = os.getenv(api_key_env_var)
        if not api_key and provider not in ["local"]:
            raise ValueError(f"API key not found in environment variable: {api_key_env_var}")
    
    scores = []
    details = []
    
    # Evaluate each output
    for name in outputs.keys():
        output_data = outputs[name]
        fixture_data = fixtures.get(name, {})
        input_data = fixture_data.get("input", {})
        expected_data = fixture_data.get("expected", {})
        
        # Format prompt
        formatted_prompt = _format_prompt(prompt_template, input_data, output_data, expected_data)
        
        try:
            cached = cache.get(model, formatted_prompt)
            if cached is not None:
                response = cached
            else:
                if provider == "openai":
                    if not api_key:
                        raise ValueError("API key required for OpenAI provider")
                    response = _call_openai(model, formatted_prompt, api_key, temperature, max_tokens, base_url)
                elif provider == "anthropic":
                    if not api_key:
                        raise ValueError("API key required for Anthropic provider")
                    response = _call_anthropic(model, formatted_prompt, api_key, temperature, max_tokens)
                elif provider == "azure":
                    if not api_key:
                        raise ValueError("API key required for Azure provider")
                    response = _call_azure(model, formatted_prompt, api_key, temperature, max_tokens, base_url)
                elif provider == "local":
                    response = _call_local(model, formatted_prompt, temperature, max_tokens, base_url)
                else:
                    raise ValueError(f"Unknown provider: {provider}")
                cache.set(model, formatted_prompt, response)
            
            # Extract score from response
            score = _extract_score_from_response(response)
            scores.append(score)
            
            # Store detailed result
            if score < 0.7:  # Only store details for low scores to avoid clutter
                details.append(f"{name}: Score {score:.2f} - {response[:100]}...")
                
        except Exception as e:
            # If evaluation fails for this item, give it a low score and record the error
            scores.append(0.0)
            details.append(f"{name}: Evaluation failed - {str(e)}")
    
    # Calculate average score
    average_score = sum(scores) / len(scores) if scores else 0.0
    
    return average_score, details


@register("llm")
def run(cfg, ev, outputs, fixtures):
    if not ev.prompt_path:
        raise ValueError("missing required field: prompt_path")
    if not ev.provider:
        raise ValueError("missing required field: provider")
    if not ev.model:
        raise ValueError("missing required field: model")
    score, fails = evaluate(
        outputs=outputs,
        fixtures=fixtures,
        provider=ev.provider,
        model=ev.model,
        prompt_path=ev.prompt_path,
        api_key_env_var=ev.api_key_env_var,
        base_url=ev.base_url,
        temperature=ev.temperature or 0.1,
        max_tokens=ev.max_tokens or 1000,
    )
    return score, fails, {}
