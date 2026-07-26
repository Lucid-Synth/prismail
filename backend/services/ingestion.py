from pathlib import Path

import pandas as pd
from langchain_core.documents import Document


def load_email_documents():

    csv_path = (
        Path(__file__).resolve().parents[1]
        / "data"
        / "email.csv"
    )

    df = pd.read_csv(csv_path)

    documents = []

    for index, row in df.iterrows():

        content = f"""
                Company Type: {row["company_type"]}
                Industry: {row["industry"]}
                Target Role: {row["role"]}

                Cold Email:
                {row["email"]}
                """

        document = Document(
            page_content=content.strip(),

            metadata={
                "id": index,
                "company_type": row["company_type"],
                "industry": row["industry"],
                "role": row["role"]
            }
        )

        documents.append(document)

    return documents