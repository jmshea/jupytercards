<meta name="google-site-verification" content="tGuXXGX2vANwJZ_tiHGqOUOOioabds1NP5AHYlqouLE" />

# JupyterCards
*JupyterCards* is a tool for displaying **interactive flash cards in Jupyter notebooks and Jupyter Book**. 

*JupyterCards* is part of my effort to make **open source tools for developing modern, interactive textbooks**.
* The other part of this effort is my interactive self-assessment quiz tool, 
[JupyterQuiz](https://github.com/jmshea/jupyterquiz).  
* You can see both tools in action in my 
(in-progress) textbook [Introduction to Data Science for Engineers](https://github.com/jmshea/intro-data-science-for-engineers).

Here is an animated GIF showing JupyterCards in action:

![Animated GIF showing the output of JupyterCards for a sample set of 3 cards](flashcards.gif)

Flash card content can be loaded from:
* a Python list of dict,
* a JSON local file,
* via a URL to a JSON file.



## Installation 

*JupyterCards* is available via pip:

``` pip install jupytercards```


## Notes on JSON File Format
The JSON file should contain a single JSON array of JSON objects. Each JSON object should have a "front"
key and a "back" key, and each value should be the string to display on the corresponding side of the 
flashcard. 

Although using JSON objects for each flashcard is overkill, this model was
chosen to support future extensions to this library.

## Example of generating flashcard files from JupyterBook notebooks

In my Jupyter notebooks that are used as input to JupyterBook, I use panels with
the heading "DEFINITION" to call out definitions in the text. I have provided a
helper program `extractdefinitions.py` that I use to scan files for the
DEFINITION header and extract the appropriate lines that follow. The resulting
terms and definitions are dumped to corresponding JSON files in a "flashcards"
directory. An additional JSON file is generated for the whole chapter.
`extractdefinitions.py` takes 2 arguments: the directory to parse and the
chapter number to use to label the overall JSON definitions file. **This program
is very specific to my workflow and I am offering it only as reference in case
it can help someone else with a similar situation.**
