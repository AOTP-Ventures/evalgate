---
title: "Test Fixtures"
section: "Core Concepts"
slug: "fixtures"
order: 5
description: "Creating and organizing test cases"
---

# Fixtures & Data Management

Test fixtures are the foundation of EvalGate evaluation. v0.3.0 introduces powerful fixture generation capabilities and advanced data management patterns to make creating comprehensive test suites effortless.

## What Are Fixtures?

Fixtures define test cases with:
- **Input data** for your AI system
- **Expected outputs** for comparison  
- **Metadata** for performance tracking
- **Context** for specialized evaluators

## Fixture Format

### Basic Fixture Structure

```json
{
  "input": {
    "text": "I love this product! Great quality.",
    "metadata": {"customer_id": "12345"}
  },
  "expected": {
    "sentiment": "positive",
    "confidence": 0.95,
    "categories": ["product_quality"]
  },
  "meta": {
    "latency_ms": 120,
    "cost_usd": 0.003,
    "model_version": "v2.1"
  }
}
```

**Required Fields:**
- `input` - Data passed to your AI system
- `expected` - Ground truth for evaluation

**Optional Fields:**
- `meta` - Performance and tracking metadata
- Any additional fields for specialized evaluators

### Conversation Fixtures

For chat-based AI systems, use conversation format:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful customer service assistant."
    },
    {
      "role": "user", 
      "content": "I need help with my order"
    },
    {
      "role": "assistant",
      "content": "I'd be happy to help with your order. Can you provide your order number?"
    }
  ],
  "expected": {
    "content": "I'd be happy to help with your order. Can you provide your order number?",
    "helpful": true,
    "asks_for_info": true,
    "professional_tone": true
  }
}
```

### Agent/Tool Use Fixtures

For AI agents and tool-using systems:

```json
{
  "input": {
    "user_request": "Book a flight from NYC to LAX for next Friday",
    "available_tools": ["search_flights", "book_flight", "get_price"]
  },
  "expected": {
    "tool_calls": [
      {
        "name": "search_flights",
        "args": {
          "from": "NYC",
          "to": "LAX", 
          "date": "2024-01-26"
        }
      },
      {
        "name": "book_flight",
        "args": {
          "flight_id": "AA123"
        }
      }
    ],
    "final_response": "I've found and booked your flight AA123 from NYC to LAX on Friday, January 26th."
  }
}
```

### Multi-Modal Fixtures

For systems handling multiple data types:

```json
{
  "input": {
    "text": "Describe this image",
    "image_url": "https://example.com/image.jpg",
    "image_base64": "iVBORw0KGgoAAAANSUhEUgA...",
    "metadata": {
      "image_size": [1024, 768],
      "format": "jpeg"
    }
  },
  "expected": {
    "description": "A red sports car parked in front of a modern building",
    "objects_detected": ["car", "building", "road"],
    "confidence_scores": {
      "car": 0.95,
      "building": 0.87
    }
  }
}
```

## Creating Fixtures

### Manual Creation (Recommended for Starting)

Create targeted test cases for critical scenarios:

**1. Critical Business Logic**
```json
{
  "input": {"transaction_amount": 10000, "risk_flags": ["new_merchant"]},
  "expected": {"risk_level": "high", "requires_review": true},
  "meta": {"test_type": "business_critical"}
}
```

**2. Edge Cases**
```json
{
  "input": {"text": ""},
  "expected": {"sentiment": "neutral", "confidence": 0.0},
  "meta": {"test_type": "edge_case", "description": "empty_input"}
}
```

**3. Regression Tests**
```json
{
  "input": {"prompt": "Previously failing case"},
  "expected": {"status": "success", "output": "Expected result"},
  "meta": {"test_type": "regression", "bug_id": "BUG-123"}
}
```

### Automated Fixture Generation (New in v0.3.0)

Generate fixtures automatically from JSON schemas:

#### Basic Generation

```bash
# Generate 50 fixtures from schema
evalgate generate-fixtures \
  --schema eval/schemas/sentiment_input.json \
  --output eval/fixtures \
  --count 50 \
  --seed 42
```

**Example Schema:**
```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "examples": [
        "This product is great!",
        "Terrible service, very disappointed", 
        "It's okay, nothing special"
      ]
    },
    "category": {
      "type": "string",
      "enum": ["electronics", "clothing", "books"]
    }
  },
  "required": ["text"]
}
```

#### Advanced Generation with Seed Data

Create realistic fixtures using seed data:

```bash
# Create seed data
cat > eval/seed_data.json << EOF
{
  "domains": ["customer_service", "product_reviews", "support_tickets"],
  "sentiment_patterns": {
    "positive": ["love", "great", "awesome", "excellent"],
    "negative": ["hate", "terrible", "awful", "disappointing"],
    "neutral": ["okay", "fine", "average", "standard"]
  },
  "customer_types": ["new", "returning", "premium"],
  "product_categories": ["electronics", "clothing", "home", "books"]
}
EOF

# Generate realistic fixtures
evalgate generate-fixtures \
  --schema eval/schemas/customer_feedback.json \
  --seed-data eval/seed_data.json \
  --count 100 \
  --output eval/fixtures/generated
```

#### Domain-Specific Generation

**Customer Service:**
```json
{
  "conversation_patterns": [
    {"user": "I need help with {issue}", "assistant": "I'd be happy to help with {issue}"},
    {"user": "My order is {status}", "assistant": "Let me check your order status"}
  ],
  "common_issues": ["billing", "shipping", "returns", "technical"],
  "response_tones": ["helpful", "apologetic", "professional", "empathetic"]
}
```

**Content Generation:**
```json
{
  "content_types": ["blog_post", "product_description", "email", "social_media"],
  "topics": ["technology", "health", "finance", "education"],
  "tones": ["formal", "casual", "persuasive", "informative"],
  "lengths": ["short", "medium", "long"]
}
```

**Classification Tasks:**
```json
{
  "label_distributions": {
    "sentiment": {"positive": 0.4, "negative": 0.3, "neutral": 0.3},
    "urgency": {"low": 0.5, "medium": 0.3, "high": 0.2}
  },
  "text_patterns": {
    "positive": ["great", "love", "excellent", "amazing"],
    "negative": ["hate", "terrible", "awful", "worst"]
  }
}
```

## Fixture Organization

### Directory Structure

```
eval/
├── fixtures/
│   ├── critical/              # Business-critical test cases
│   │   ├── payment_processing.json
│   │   └── fraud_detection.json
│   ├── edge_cases/           # Boundary and error conditions
│   │   ├── empty_inputs.json
│   │   └── malformed_data.json
│   ├── regression/           # Previously failing cases
│   │   ├── bug_123.json
│   │   └── bug_456.json
│   ├── generated/            # Auto-generated fixtures
│   │   ├── batch_001.json
│   │   └── batch_002.json
│   └── performance/          # Large-scale performance tests
│       ├── high_volume.json
│       └── stress_test.json
├── schemas/                  # JSON schemas for generation
│   ├── customer_input.json
│   └── product_review.json
└── seed_data/               # Seed data for generation
    ├── customer_service.json
    └── product_catalog.json
```

### Naming Conventions

**Descriptive Names:**
- `payment_fraud_high_risk.json` - Clear purpose
- `conversation_angry_customer.json` - Specific scenario  
- `text_generation_blog_post.json` - Task and context

**Batch Naming:**
- `generated_001.json` to `generated_100.json` - Sequential
- `regression_v2_3_001.json` - Version-specific
- `performance_1k_items.json` - Scale indicator

### Fixture Metadata

Track fixture provenance and purpose:

```json
{
  "input": {"text": "Example input"},
  "expected": {"sentiment": "positive"},
  "meta": {
    "fixture_id": "cust_001",
    "created_by": "data_team",
    "created_date": "2024-01-15",
    "source": "customer_tickets",
    "purpose": "edge_case_testing",
    "priority": "high",
    "tags": ["edge_case", "customer_service", "urgent"],
    "last_updated": "2024-01-20"
  }
}
```

## Fixture Quality Best Practices

### ✅ **Comprehensive Coverage**

**Positive Cases (60-70%)**
- Typical successful scenarios
- Common user inputs
- Expected happy path flows

**Negative Cases (20-30%)**
- Error conditions
- Invalid inputs
- System failures

**Edge Cases (10-20%)**
- Boundary conditions
- Unusual but valid inputs
- Corner cases

### 🎯 **Balanced Distribution**

For classification tasks:
```json
{
  "label_distribution": {
    "positive": 400,
    "negative": 300, 
    "neutral": 300
  },
  "confidence_ranges": {
    "high": 500,
    "medium": 300,
    "low": 200
  }
}
```

### 📊 **Representative Data**

**Match Production Distribution:**
- Similar vocabulary and phrasing
- Realistic data patterns
- Representative complexity levels
- Appropriate length distributions

**Include Diversity:**
- Multiple domains/topics
- Various input formats
- Different user types/contexts
- Temporal variations

### 🔄 **Regular Updates**

**Version Control Fixtures:**
```bash
git add eval/fixtures/
git commit -m "Add fixtures for new product category feature"
```

**Quarterly Review Process:**
1. Analyze production vs fixture distribution
2. Identify gaps in test coverage
3. Add new fixtures for recent features
4. Remove obsolete test cases

## Advanced Fixture Patterns

### Parameterized Fixtures

Create fixture templates for multiple variations:

```json
{
  "template": true,
  "parameters": {
    "sentiment": ["positive", "negative", "neutral"],
    "category": ["electronics", "clothing", "books"],
    "urgency": ["low", "high"]
  },
  "input_template": {
    "text": "This {category} product is {sentiment_adjective}",
    "priority": "{urgency}"
  },
  "expected_template": {
    "sentiment": "{sentiment}",
    "category": "{category}",
    "urgent": "{urgency == 'high'}"
  }
}
```

### Fixture Chains

For multi-step workflows:

```json
{
  "chain": [
    {
      "step": "initial_request",
      "input": {"user_query": "I want to return an item"},
      "expected": {"action": "request_order_details"}
    },
    {
      "step": "provide_details", 
      "input": {"order_id": "12345", "reason": "defective"},
      "expected": {"action": "initiate_return"}
    },
    {
      "step": "confirm_return",
      "input": {"confirmation": true},
      "expected": {"status": "return_approved", "tracking": "RET123"}
    }
  ]
}
```

### Dynamic Fixtures

Generate context-aware test data:

```python
# scripts/generate_dynamic_fixtures.py
import json
from datetime import datetime, timedelta

def create_seasonal_fixtures():
    """Generate fixtures that vary by season/time."""
    current_month = datetime.now().month
    
    if current_month in [11, 12, 1]:  # Holiday season
        topics = ["gifts", "holiday_returns", "shipping_delays"]
        urgency_weight = 0.4  # Higher urgency during holidays
    else:
        topics = ["general_inquiries", "product_questions"]
        urgency_weight = 0.2
        
    fixtures = []
    for i in range(100):
        fixture = {
            "input": {
                "text": f"Question about {random.choice(topics)}",
                "timestamp": datetime.now().isoformat()
            },
            "expected": {
                "topic": random.choice(topics),
                "urgent": random.random() < urgency_weight
            }
        }
        fixtures.append(fixture)
    
    return fixtures
```

## Fixture Validation

### Schema Validation

Validate fixture structure automatically:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EvalGate Fixture",
  "type": "object",
  "required": ["input", "expected"],
  "properties": {
    "input": {"type": "object"},
    "expected": {"type": "object"},
    "meta": {
      "type": "object",
      "properties": {
        "latency_ms": {"type": "number", "minimum": 0},
        "cost_usd": {"type": "number", "minimum": 0}
      }
    }
  }
}
```

### Quality Checks

Run quality validation on fixtures:

```bash
# scripts/validate_fixtures.py
python scripts/validate_fixtures.py \
  --fixtures eval/fixtures/**/*.json \
  --schema eval/schemas/fixture_schema.json \
  --check-balance \
  --check-duplicates
```

## Integration with EvalGate

### Configuration

Reference fixtures in your configuration:

```yaml
fixtures:
  path: "eval/fixtures/**/*.json"
  
# Use specific fixture subsets for different evaluators
evaluators:
  - name: critical_path_validation
    type: category
    expected_field: "sentiment"
    fixture_filter: "meta.priority == 'high'"
    weight: 0.4
    
  - name: edge_case_testing
    type: schema
    schema_path: eval/schemas/output.json
    fixture_filter: "meta.tags contains 'edge_case'"
    weight: 0.2
```

### Fixture Loading

EvalGate automatically:
- Loads all fixtures matching the path pattern
- Validates JSON format
- Matches fixtures to outputs by filename
- Provides detailed error messages for issues

## Migration and Maintenance

### From v0.2.0 to v0.3.0

v0.3.0 is backward compatible, but you can enhance fixtures:

```bash
# Add metadata to existing fixtures
python scripts/enhance_fixtures.py \
  --input eval/fixtures/ \
  --add-metadata \
  --add-ids
```

### Fixture Lifecycle Management

**Monthly Review:**
1. Analyze fixture effectiveness metrics
2. Identify low-value or redundant fixtures  
3. Add fixtures for new features/edge cases
4. Update expected outputs for model improvements

**Version Control:**
- Tag fixture sets with release versions
- Branch fixtures for experimental features
- Archive obsolete fixture sets

## Next Steps

- **[LLM as Judge](06-llm-as-judge.md)** - AI-powered evaluation setup
- **[Examples](10-examples.md)** - Real-world fixture examples
- **[CLI Reference](12-cli-reference.md)** - Complete fixture generation commands
- **[Best Practices](11-best-practices.md)** - Production fixture strategies

---

*Well-designed fixtures are the foundation of effective AI evaluation. EvalGate v0.3.0's generation capabilities make it easier than ever to create comprehensive, realistic test suites.*
