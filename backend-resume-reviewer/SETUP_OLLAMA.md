# Setting Up Ollama for CV Extraction

The Resume Reviewer requires Ollama to extract and analyze CV content.

## Quick Setup

1. **Download Ollama:**
   - Visit: https://ollama.com
   - Download and install Ollama for Windows

2. **Start Ollama:**
   - Ollama should start automatically after installation
   - Or run: `ollama serve` in a terminal
   - Verify it's running: Open http://localhost:11434 in your browser

3. **Download the Required Model:**
   ```bash
   ollama pull gemma3:4b
   ```

4. **Verify Installation:**
   ```bash
   ollama list
   ```
   You should see `gemma3:4b` in the list.

## Testing Ollama

Test if Ollama is working:
```bash
curl http://localhost:11434/api/tags
```

Or visit: http://localhost:11434/api/tags in your browser.

## Troubleshooting

- **Port 11434 already in use:** Another Ollama instance might be running. Check with `netstat -ano | findstr :11434`
- **Model not found:** Make sure you ran `ollama pull gemma3:4b`
- **Connection refused:** Ollama service is not running. Start it with `ollama serve`

## Note

Without Ollama running, CV file extraction will not work. However, if you already have CV data in JSON format, you can use the scoring endpoints directly without extraction.


