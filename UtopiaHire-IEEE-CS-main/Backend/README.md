# AI-Driven Adaptive Interview Simulator Backend

A modular, production-ready FastAPI backend for conducting adaptive technical and soft skills interviews using AI agents.

## 🎯 Features

- **Adaptive Difficulty**: Dynamic question difficulty adjustment based on candidate performance
- **Dual Agent System**: Separate agents for question generation and answer evaluation  
- **Comprehensive Scoring**: Multi-criteria evaluation with detailed feedback
- **Persistent Storage**: JSON-based session management with backup functionality
- **RESTful API**: Clean FastAPI endpoints for easy integration
- **Mock Mode**: Development-friendly mock agents (easily replaceable with LLM integration)

## 🏗️ Architecture

```
Backend/
├── main.py                     # FastAPI application entry point
├── models/                     # Pydantic data models
│   ├── interview.py           # Interview session schemas
│   └── evaluation.py          # Scoring and evaluation utilities
├── agents/                     # AI agent implementations
│   ├── interviewer_agent.py   # Question generation agent
│   └── evaluator_agent.py     # Answer evaluation agent
├── services/                   # Business logic layer
│   ├── interview_manager.py   # Core interview orchestration
│   └── storage.py             # Data persistence utilities
├── utils/                      # Shared utilities
│   ├── config.py              # Application configuration
│   ├── id_utils.py            # ID generation utilities
│   └── scoring.py             # Scoring algorithms
├── data/                       # Data storage
│   └── interviews/            # Interview session files
└── test_interview_system.py   # Comprehensive test suite
```

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Test Suite**
   ```bash
   python test_interview_system.py
   ```

3. **Start the API Server**
   ```bash
   python main.py
   ```

4. **Access API Documentation**
   - OpenAPI docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/start_interview` | POST | Create new interview session |
| `/next_question` | GET | Generate next adaptive question |
| `/submit_answer` | POST | Submit and evaluate answer |
| `/summary/{id}` | GET | Get comprehensive interview summary |
| `/status/{id}` | GET | Get current interview status |
| `/interviews` | GET | List available interviews |

## 🔧 Configuration

Key settings in `utils/config.py`:

- **Adaptive Thresholds**: Upper (80) and lower (50) score thresholds for level adjustment
- **Score Window**: 3 recent questions for level adjustment decisions
- **Question Limits**: 1-50 questions per interview
- **Mock Mode**: Enable/disable mock agents for development

## 📊 Scoring System

- **Multi-criteria Evaluation**: Correctness, depth, clarity, relevance
- **Weighted Scoring**: Higher difficulty questions contribute more to final score
- **Adaptive Logic**: Dynamic difficulty adjustment based on performance trends
- **Comprehensive Feedback**: Detailed subscores and improvement recommendations

## 🧠 Agent System

### Interviewer Agent
- Generates contextual questions based on job requirements
- Balances technical vs soft skills based on specified ratio
- Adapts to current difficulty level and candidate progress
- Avoids repetitive question patterns

### Evaluator Agent  
- Analyzes answers across multiple criteria
- Provides detailed feedback and optimal answer examples
- Makes level adjustment recommendations
- Generates constructive improvement suggestions

## 💾 Data Management

- **JSON Storage**: Human-readable interview session files
- **Backup System**: Automatic backups before modifications
- **Thread Safety**: Concurrent access protection
- **Export/Import**: Easy data portability

## 🔌 Integration Ready

The backend is designed for easy integration with:

- **Streamlit**: For rapid frontend development
- **React/Vue**: For full web applications  
- **Mobile Apps**: Via RESTful API
- **LLM Services**: OpenAI, Anthropic, or custom models

## 🧪 Testing

Run the comprehensive test suite to verify functionality:

```bash
python test_interview_system.py
```

The test simulates a complete interview workflow:
1. Creates interview session
2. Generates and answers 8 questions
3. Demonstrates adaptive difficulty adjustment
4. Produces final summary and recommendations
5. Tests all storage and API operations

## 🔧 Customization

### Adding LLM Integration

Replace mock agents in `agents/` with real LLM calls:

```python
# In interviewer_agent.py
def _generate_llm_question(self, ...):
    # Integrate with OpenAI, Anthropic, etc.
    response = openai.chat.completions.create(...)
    return process_response(response)
```

### Custom Scoring

Modify scoring weights and algorithms in `utils/scoring.py`:

```python
SCORE_WEIGHTS = {
    "correctness": 0.4,   # Increase technical weight
    "depth": 0.3,
    "clarity": 0.2,
    "relevance": 0.1
}
```

### Question Templates

Extend question templates in `agents/interviewer_agent.py`:

```python
def _load_question_templates(self):
    # Add domain-specific question templates
    return updated_templates
```

## 📋 Example Usage

```python
# Create interview
interview_id, session = manager.create_interview(
    job_title="Senior Software Engineer",
    num_questions=10,
    soft_pct=0.3,
    keywords=["Python", "algorithms", "system design"]
)

# Generate question
question = manager.generate_next_question(interview_id)

# Submit answer
success, result = manager.submit_answer(
    interview_id, 
    "Detailed technical answer..."
)

# Get final summary
summary = manager.get_interview_summary(interview_id)
```

## 🚀 Production Deployment

For production deployment:

1. Set `ENVIRONMENT=production`
2. Configure proper CORS origins
3. Add authentication/authorization
4. Set up proper logging
5. Use production ASGI server (Gunicorn + Uvicorn)
6. Configure LLM integration
7. Set up monitoring and health checks

## 🤝 Contributing

The codebase follows SOLID principles with clear separation of concerns:

- **Models**: Data structures and validation
- **Agents**: AI logic and decision making
- **Services**: Business logic and orchestration  
- **Utils**: Shared functionality and configuration

Each module is independently testable and easily extensible.

## 📄 License

This project is designed for educational and development purposes. Modify and extend as needed for your specific requirements.