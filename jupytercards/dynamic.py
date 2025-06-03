from IPython.display import display, HTML, Javascript
import string
import random
import json
import urllib.request
#import pkg_resources
import importlib.resources
from typing import Any, List, Dict, Tuple, Union, Optional
from urllib.parse import urlparse
try:
    # Python 3.9+
    from importlib.resources import files
except ImportError:
    # Backport for older Pythons
    from importlib_resources import files
import sys

# Helper functions to break up display logic
def _load_resources() -> Tuple[str, str]:
    """Load CSS and JS resources as HTML/JS strings."""
    pkg = __name__.split('.')[0]
    css_path = files(pkg).joinpath('styles.css')
    js1_path = files(pkg).joinpath('swiped-events.min.js')
    js2_path = files(pkg).joinpath('flashcards.js')
    css = css_path.read_bytes().decode('utf-8')
    js1 = js1_path.read_bytes().decode('utf-8')
    js2 = js2_path.read_bytes().decode('utf-8')
    styles = f"<style>\n{css}\n</style>"
    script = js1 + js2
    return styles, script

def _parse_ref(ref: Union[str, List[Dict[str, Any]]]) -> Tuple[List[Dict[str, Any]], bool, Optional[str]]:
    """Parse the ref into cards list, static flag, and optional URL."""
    if isinstance(ref, list):
        return ref, True, None
    if isinstance(ref, str):
        s = ref.strip()
        # JSON string
        if s.startswith('['):
            return json.loads(s), True, None
        # URL
        parsed = urlparse(s)
        if parsed.scheme in ('http', 'https'):
            data = urllib.request.urlopen(s).read().decode('utf-8')
            return json.loads(data), False, s
        # File path
        with open(s) as f:
            return json.load(f), True, None
    raise ValueError("ref must be a list, JSON string, URL, or file path")

def _filter_cards(cards: List[Dict[str, Any]], topics: Optional[Union[str, List[str]]]) -> List[Dict[str, Any]]:
    """Filter cards by topics if provided."""
    if not topics:
        return cards
    if isinstance(topics, str):
        topics = [topics]
    filtered: List[Dict[str, Any]] = []
    for card in cards:
        t = card.get('topic')
        if isinstance(t, list):
            if any(topic in t for topic in topics):
                filtered.append(card)
        else:
            if any(topic == t for topic in topics):
                filtered.append(card)
    return filtered

def _build_js(div_id: str,
              cards: List[Dict[str, Any]],
              front_colors: List[str],
              back_colors: List[str],
              text_colors: List[str],
              keyControl: bool,
              grabFocus: bool,
              shuffle_cards: bool,
              title: str,
              subject: str,
              static: bool,
              url: Optional[str]) -> str:
    """Build the JavaScript payload to initialize flashcards."""

    # Add unique sequence number to each card
    for i, card in enumerate(cards):
        card['seqNum'] = i 
    # MutationObserver to wait for div, set dataset attributes, and initialize cards
    observer = f"""(function() {{
    var observer = new MutationObserver(function(mutations, obs) {{
        var el = document.getElementById("{div_id}");
        if (el) {{
            el.dataset.url = {json.dumps(url) if url else '""'};
            el.dataset.cards = JSON.stringify({json.dumps(cards)});
            el.dataset.frontColors = JSON.stringify({json.dumps(front_colors)});
            el.dataset.backColors = JSON.stringify({json.dumps(back_colors)});
            el.dataset.textColors = JSON.stringify({json.dumps(text_colors)});
            el.dataset.keyControl = {str(keyControl).lower()};
            el.dataset.grabFocus = {str(grabFocus).lower()};
            el.dataset.shuffleCards = {str(shuffle_cards).lower()};
            el.dataset.title = {json.dumps(title)};
            el.dataset.subject = {json.dumps(subject)};
            createCards("{div_id}");
            obs.disconnect();
        }}
    }});
    observer.observe(document.body, {{ childList: true, subtree: true }});
}})();"""
    parts: List[str] = []
    parts.append(observer)

    return "\n".join(parts)


def display_flashcards(ref, keyControl=True, grabFocus=False,
                       shuffle_cards=False,
                       front_colors=None,
                       back_colors=None,
                       text_colors=None,
                       title='',
                       subject='',
                       topics=None,
                       known_widgets=True,
                       local_storage=False):  
    '''
    Display interactive flash cards using a mix of Python and Javascript to support
    use in rendered notebooks (especially JupyterBook, but also Voila)

    Inputs:
    ref = string, reference to quiz JSON, may be:
          - file name
          - URL
          - Python list

    keyControl = boolean, whether to support keyboard: right = advance, space = flip

    grabFocus = boolean, whether to put browser focus on this slide deck
                (may cause browser to jump to the slide deck)

    shuffle_cards = boolean, whether to present cards in order given or to randomize order
                    every time you cycle through them

    front_colors
    back_colors
    text_colors = None or list of strings specfiying alternate colors.
                  front_colors, back_colors also support 'jupytercon' to use JupyterCon (2023) color theme

    title   = string, title of this flashcard set for use in structured data
    subject = string, subject of this flashcard set for use in structured data

    topics = string or list, topic or topics to filter flashcards

    known_widgets = boolean, whether to display known/not known icons and enable actions for those icons.
    local_storage = boolean, whether to prompt for and enable localStorage  for persistence across
                    sessions (default False).

    John  M. Shea
    2021-2025
    '''

    # Specify default front colors
    front_color_dict = [
        'var(--asparagus)',
        'var(--terra-cotta)',
        'var(--cyan-process)'
    ]

    # Specify default back color
    back_color_dict = [
        'var(--dark-blue-gray)'
    ]

    # Define color schemes for JupyterCon (2023)
    jupytercon_front = [
        'hsla(17.65,100%,50%,1)',
        'rgb(234,196,53)',
        'hsla(200,76.74%,83.14%, 1)'
    ]

    jupytercon_back = [
        'hsla(208.78,66.49%,36.27%,1)'
    ]

    # Specify default text color
    text_color_dict = [
        'var(--snow)'
    ]

    # Allow user to specify alternate color schemes
    if front_colors:
        if isinstance(front_colors, list):
            front_color_dict = front_colors
        elif front_colors == 'jupytercon':
            front_color_dict = jupytercon_front

    if back_colors:
        if isinstance(back_colors, list):
            back_color_dict = back_colors
        elif back_colors == 'jupytercon':
            back_color_dict = jupytercon_back

    if text_colors:
        if isinstance(text_colors, list):
            text_color_dict = text_colors

    # Load external CSS and JavaScript resources
    styles, script = _load_resources()
    # Load SVG symbols
    symbols_path = files(__name__.split('.')[0]).joinpath('svg-symbols.svg')
    svg_symbols = symbols_path.read_bytes().decode('utf-8')

    # Generate a unique ID for each card set
    letters = string.ascii_letters
    div_id = ''.join(random.choice(letters) for i in range(12))
    # print(div_id)


    # This will be the container for the cards, bootstrap topics to Javascript
    # Prepare topics list for JS
    # Include data-local-storage attribute if requested
    if topics:
        if isinstance(topics, str):
            _topics_list = [topics]
        else:
            _topics_list = topics
    else:
        _topics_list = []
    _topics_json = json.dumps(_topics_list)
    mydiv = (f'<div class="flip-container" id="{div_id}" '
             f'data-topics=\'{_topics_json}\' data-known-widgets=\'{str(known_widgets).lower()}\' '
             f'data-local-storage=\'{str(local_storage).lower()}\' '
             f'tabindex="0" style="outline:none;"></div>')



    #Spacer and Next button elements
    spacer='<div style="height:40px"></div>'
    nextbutton=f"""<div class="next" id="{div_id}-next" onclick="window.checkFlip('{div_id}')"> </div> """


    # Handling data based on the type of `ref` (string, URL, or Python list)
    json_data = ""
    if type(ref) == list:
        #loadData += json.dumps(ref)
        all_cards = ref
        static = True
        url = ""
    elif type(ref) == str:
        if ref[0] == "[":
            #print("String detected. Assuming JSON")
            #loadData += ref
            all_cards = json.loads(ref)
            static = True
            url=""
        elif ref.lower().find("http") == 0:
            url = ref
            if sys.platform == 'emscripten':
                try: 
                    from pyodide.http import open_url
                except:
                    try:
                        from pyodide import open_url
                    except:
                        print('Importing open_url failed. Please raise an issue at')
                        print('https://github.com/jmshea/jupyterquiz/issues')

                json_data += open_url(url).read()
            else:
                file = urllib.request.urlopen(url)

                for line in file:
                    json_data += line.decode("utf-8")
            static = False
            #print(json_data)
            all_cards = json.loads(json_data)
        else:
            #print("File detected")
            with open(ref) as file:
                for line in file:
                    json_data += line
            static = True
            url = ""
            #print(json_data)
            all_cards = json.loads(json_data)
    else:
        raise Exception("First argument must be list (JSON), URL, or file ref")



    # Pass all cards to the frontend for filtering by topics
    cards = all_cards

    loadData =_build_js(div_id, cards, front_color_dict, back_color_dict, text_color_dict,
                        keyControl, grabFocus, shuffle_cards, title, subject, static, url) 

    # Display the content in the notebook
    display(HTML(styles))
    display(HTML(svg_symbols))
    display(HTML(spacer+mydiv+spacer+nextbutton+spacer))
    display(Javascript(script+loadData))


# Functions to help make flashcard JSON files

def makecard (name, front, back):
  """ Convert captured data for a flashcard into a dictionary

  Helper for md2json() function, which converts flashcard entries from
  Markdown to JSON. We allow several different ways to enter
  the flashcard entries in Markdown, and this function 
  handles identifying those cases and putting the proper values
  into a dictionary

  Parameters
  ----------
  name : string
    The name for the flashcard
  front : string
    The first string found after the name but before the "---" break. Usually the
    front of the flashcard
  back: string
    The string after the "---" break, which is usually the back of the flashcard

  Returns
  -------
  dict
    A dictionary with the input strings matched to the proper 'name', 'front',
    and 'back' keys
  """

  # Deal with options
  if front and not back:
    back=front
    front=name
  elif back and not front:
    front=name
  card = {'name':name,
          'front':front,
          'back':back}
 
  return card



def md2json(md, savefile = False):
  """ Connvert markdown flashcards to JSON

  Input a Markdown string, where each level 1 heading denotes the
  start of a new flashcard. Flashcards can be entered in several ways,
  as noted at http:jupytercards.org. Process the Markdown string and 
  output (and optionally save to a file) JSON ready for consumption by 
  the display_flashcards() function of JupyterCards.

  Parameters
  ----------
  md : string
      A string containing flashcards written in Markdown
  savefile : string (Boolean)
      The name of a file to save the JSON output to. If no file is given, 
      the JSON is returned as a string


  Returns
  -------
  string
    The JSON representation of the flashcards
  """

  cards=[]
  back = False

  front=''
  back=''
  blank=False
  onback=False

  for line in iter(md.splitlines()):
    line=line.strip()
    if line:
      if line[0]=="#":
        while line[0] == "#":
          line = line[1:]
        # And if we have content for a card, save it to our list of dicts
        if front or back:
          card=makecard(name, front, back)
          cards+=[card]

        # Save the name for the new card and initialize the parser state
        name = line.strip()
        front=''
        back=''
        onback = False
        blank = False
      else:
        if len(line)>=3 and line[:3]=='---':
          onback = True
        else: 
          if onback:
            if back:
              back += ' ' 
            back += line
          else:
            if front:
              front += ' '
            front += line
          #print(front,back)

    else:
      if onback and back:
        back += '<br>'
        blank = False
      elif front:
        front += '<br>'
        blank = False

  card=makecard(name, front, back)
  cards+=[card]


  if savefile:
    with open(savefile, 'w') as f:
      json.dump(cards, f)

  return json.dumps(cards, indent=4)

