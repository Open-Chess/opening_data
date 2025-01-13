import re
import pandas as pd
import unicodedata

def normalize(name: str) -> str:
    # Normalize the text to decompose special characters into base characters
    normalized = unicodedata.normalize('NFD', name)
    # Filter out combining marks (e.g., accents)
    ascii_text = ''.join(c for c in normalized if not unicodedata.combining(c))
    # Remove unwanted characters except hyphens
    ascii_text = re.sub(r"[^\uAC00-\uD7A30-9a-zA-Z\s-]", "", ascii_text)
    # Convert to lowercase and replace spaces/tabs/newlines with hyphens
    ascii_text = ascii_text.lower().replace(" ", "-").replace("\t", "-").replace("\n", "-")
    return ascii_text

# Read the input CSV files
my_db = pd.read_csv("my_db.csv")
lichess_db = pd.read_csv("lichess_db.csv")

# Prepare the output DataFrame
output_data = []

for _, row in lichess_db.iterrows():
    eco = row['eco']
    name = row['name']
    pgn = row['pgn']
    
    # Generate url_name using normalize
    url_name = normalize(name)

    # Check if the normalized name matches any opening_name in my_db
    mdx_match = my_db[my_db['opening_name'] == url_name]
    mdx = mdx_match['description_file'].iloc[0] if not mdx_match.empty else None

    # Append the row to the output_data
    output_data.append({
        "eco": eco,
        "name": name,
        "url_name": url_name,
        "pgn": pgn,
        "mdx": mdx
    })

# Create the output DataFrame
output_df = pd.DataFrame(output_data)

# Save to a new CSV file
output_df.to_csv("dist/eco_data.csv", index=False)

print("CSV file has been successfully merged and saved as 'dist/eco_data.csv'.")
