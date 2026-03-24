from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def analyze_similarity(new_description: str, existing_descriptions: list[str]) -> float:
    """
    Compares a new description against a list of existing descriptions
    using TF-IDF and Cosine Similarity.
    Returns the maximum similarity percentage found (0.0 to 100.0).
    """
    if not existing_descriptions:
        return 0.0

    # Include the new description at the end for the vectorizer
    all_docs = existing_descriptions + [new_description]
    
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(all_docs)
    except ValueError:
        # Happens if docs are completely empty or only stop words
        return 0.0

    # Cosine similarity of the new document (last one) against all others
    cosine_similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
    
    # Get the max similarity value
    max_sim = np.max(cosine_similarities)
    
    # Convert to percentage
    return float(max_sim * 100.0)
