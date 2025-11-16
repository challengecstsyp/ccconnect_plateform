"""
Test script to test PDF generation directly (without Ollama or API).
This script tests the LaTeX to PDF generation functionality.
"""
import json
from infrastructure.latex_gen.pdf_generator import generate_pdf_from_cv

# Sample CV data for testing
sample_cv_data = {
    "name": "John Doe",
    "location": "New York, NY",
    "email": "john.doe@email.com",
    "phone": "+1 (555) 123-4567",
    "website": "https://johndoe.com",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "summary": "Experienced software developer with 5+ years of experience in full-stack development. Proven track record of delivering high-quality applications.",
    "experience": [
        {
            "title": "Senior Software Engineer",
            "company": "Tech Corp",
            "start": "2020",
            "end": "Present",
            "details": [
                "Developed and maintained web applications using React and Node.js",
                "Led a team of 5 developers to deliver a major product update",
                "Improved application performance by 40% through optimization"
            ]
        },
        {
            "title": "Software Developer",
            "company": "Startup Inc",
            "start": "2018",
            "end": "2020",
            "details": [
                "Built RESTful APIs using Python and Flask",
                "Implemented automated testing reducing bugs by 30%",
                "Collaborated with cross-functional teams to deliver features"
            ]
        }
    ],
    "education": [
        {
            "degree": "Bachelor of Science in Computer Science",
            "school": "University of Technology",
            "start": "2014",
            "end": "2018",
            "details": [
                "Graduated with honors",
                "Relevant coursework: Data Structures, Algorithms, Software Engineering"
            ]
        }
    ],
    "projects": [
        {
            "name": "E-Commerce Platform",
            "link": "https://github.com/johndoe/ecommerce",
            "details": [
                "Built a full-stack e-commerce platform using React and Node.js",
                "Implemented payment processing with Stripe API",
                "Deployed on AWS with CI/CD pipeline"
            ]
        }
    ],
    "skills": [
        "JavaScript",
        "Python",
        "React",
        "Node.js",
        "SQL",
        "AWS"
    ],
    "technologies": [
        "Git",
        "Docker",
        "Kubernetes",
        "MongoDB",
        "PostgreSQL"
    ]
}

def test_pdf_generation():
    """Test PDF generation from CV data."""
    print("Testing PDF generation...")
    print(f"CV Name: {sample_cv_data['name']}")
    print(f"Experience entries: {len(sample_cv_data['experience'])}")
    print(f"Education entries: {len(sample_cv_data['education'])}")
    print(f"Projects: {len(sample_cv_data['projects'])}")
    print()
    
    try:
        # Generate PDF
        pdf_bytes = generate_pdf_from_cv(sample_cv_data)
        
        if pdf_bytes:
            # Save PDF to file
            output_path = "test_output.pdf"
            with open(output_path, "wb") as f:
                f.write(pdf_bytes)
            
            print(f"✅ SUCCESS: PDF generated successfully!")
            print(f"📄 PDF saved to: {output_path}")
            print(f"📊 PDF size: {len(pdf_bytes)} bytes ({len(pdf_bytes) / 1024:.2f} KB)")
            return True
        else:
            print("❌ FAILED: PDF generation returned None")
            print("💡 Make sure LaTeX (pdflatex) is installed and in your PATH")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print("💡 Make sure LaTeX (pdflatex) is installed and in your PATH")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("PDF Generation Test")
    print("=" * 50)
    print()
    
    success = test_pdf_generation()
    
    print()
    print("=" * 50)
    if success:
        print("✅ Test completed successfully!")
    else:
        print("❌ Test failed. Check error messages above.")
    print("=" * 50)

