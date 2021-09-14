# JupyterCards
JupyterCards is a tool for displaying **interactive flash cards in Jupyter notebooks and Jupyter Book**. 

The flash cards can be loaded from a Python list of dicts, a JSON local file, or via a URL to a JSON file.
The JSON file should contain a single JSON array of JSON objects. Each JSON object should have a "front"
key and a "back" key, and each value should be the string to display on the corresponding side of the 
flashcard.   

Although using JSON objects for each flashcard is overkill, this model was
chosen to support future extensions to this library.
