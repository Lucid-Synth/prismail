import os

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from backend.services.ingestion import load_email_documents
from dotenv import load_dotenv
import chromadb
import uuid

load_dotenv()

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001"
)

emails = load_email_documents()

vector = embeddings.embed_query(emails[0].page_content)

print("Embedding successful!")
print(vector)

client = chromadb.CloudClient(
    api_key=os.getenv("CHROMA_API_KEY"),
    tenant=os.getenv("CHROMA_TENANT"),
    database=os.getenv("CHROMA_DATABASE")
)

collection = client.get_collection(name="emails")

collection.add(
    ids = [str(uuid.uuid4())],
    embeddings=[vector],
    documents=[emails.page_content],
    metadatas=[emails.metadata]
)

print("Embeddings stored in chromaDB")