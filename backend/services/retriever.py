import os

import chromadb
from services.query_embedding import query_embedding

client = chromadb.CloudClient(
    api_key=os.getenv("CHROMA_API_KEY"),
    tenant=os.getenv("CHROMA_TENANT"),
    database=os.getenv("CHROMA_DATABASE")
)

collection = client.get_collection(name="emails")

def retrieve_emails(
    company: str,
    role: str,
    skills: str,
    tone: str,
    n_results: int = 3
):

    query = f"""
    Cold email for a {role} opportunity at {company}.
    Skills: {skills}.
    Tone: {tone}.
    """

    embedding = query_embedding(query)

    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results
    )

    return results["documents"][0]
