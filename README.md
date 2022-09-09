
# JupyterCards
*JupyterCards* is a tool for displaying **interactive flash cards in Jupyter notebooks and Jupyter Book**. 

*JupyterCards* is part of my effort to make **open source tools for developing modern, interactive textbooks**.
* The other part of this effort is my interactive self-assessment quiz tool, 
[JupyterQuiz](https://github.com/jmshea/jupyterquiz).  
* You can see both tools in action in my 
(in-progress) textbook [Foundations of Data Science with Python](https://jmshea.github.io/Foundations-of-Data-Science-with-Python/).

Here is an animated GIF showing JupyterCards in action:

![Animated GIF showing the output of JupyterCards for a sample set of 3 cards](flashcards.gif)

Flash card content can be loaded from:
* a Python list of dict,
* a JSON local file,
* via a URL to a JSON file.

As of version 1.7, JupyterCards supports switching cards by swiping left on touch devices. 

**Note:** JupyterCards always requires MathJax to be loaded. If you are using JupyterBook,
it may not always load MathJax if you do not have any LaTeX on your page. To resolve this, 
you can include the invisible math command $\,\!$ in any Markdown cell. I hope to remove
this requirement in the future.


## Installation 

*JupyterCards* is available via pip:

``` pip install jupytercards```

## Keyboard Controls

Verson 2.0.0rc1 adds keyboard controls:
* Space to flip card over
* Enter, right arrow, or j to slide to next card

This version is a release candidate, so install like

`pip install jupytercards==2.0.0rc1`

**Notes:** 
* In Jupyter Book, you may have to click the card to get focus before using the keyboard shortcuts. 
* In Jupyter Lab, hovering your mouse over the body of the card should be sufficient to send key presses to Jupyter Cards.
* In both, you may need to avoid math typeset by MathJax because that can intercept key presses.
* You may disable keyboard control using `keyControl` keyword parameter: `display_flashcards(ref, keyControl = False)`.
* **If you test the keyboard controls, please add your feedback to the related Issue, or email me/tweet at me.**


## Notes on JSON File Format
The JSON file should contain a single JSON array of JSON objects. Each JSON object should have two keys
that will be utilized:
* "front": a string containing the text to be shown on the **front** of the card
* "back": a string containing the text to be shown on the **back** of the card

Although using JSON objects for each flashcard is overkill, this model was
chosen to support future extensions to this library.

## Making flashcards in Markdown 

As of version 1.9.0, I have added helper functions to convert flashcards created in Markdown to the
JSON format that JupyterCards expects. In its simplest version, just put the front text in a Markdown
heading (line starting with #) and put the back text below.   See (Markdown-flashcards.ipynb) for
more discussion and examples of how to use this functionality.

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
