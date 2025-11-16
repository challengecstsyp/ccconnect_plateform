from pydantic import BaseModel

class CVJDRequest(BaseModel):
    cv_data: dict
    job_description: str


