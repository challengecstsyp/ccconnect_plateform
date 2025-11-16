from setuptools import setup, find_packages

setup(
    name="backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.95.0",
        "uvicorn[standard]>=0.23.0",
        "pydantic>=1.10.0",
        "python-dotenv>=1.0.0",
        "typing-extensions>=4.0.0",
        "ollama>=0.1.0",
    ],
    python_requires=">=3.10",
)