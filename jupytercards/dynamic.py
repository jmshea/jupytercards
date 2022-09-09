

from IPython.core.display import display,  HTML, Javascript
import string
import random
import json
import urllib.request
import pkg_resources

def display_flashcards(ref, keyControl = True):

    resource_package = __name__
    styles = "<style>\n"
    css = pkg_resources.resource_string(resource_package, "styles.css")
    styles += css.decode("utf-8")
    styles += "\n</style>"

    #script ='<script src="swiped-events.min.js"></script>'

    script = ''
    js = pkg_resources.resource_string(resource_package, "swiped-events.min.js")
    script += js.decode("utf-8")
    js = pkg_resources.resource_string(resource_package, "flashcards.js")
    script += js.decode("utf-8")

    #print(script)



    #print(card["front"], card["back"])
    letters = string.ascii_letters
    div_id = ''.join(random.choice(letters) for i in range(12))
    #div_id='ABBA'
    # print(div_id)

    # Container
    #mydiv =  '<div class="flip-container" id="'+ div_id + '"></div>'
    mydiv =  f'<div class="flip-container" id="{div_id}" tabindex="0" style="outline:none;"></div>'



    #Spacer
    spacer='<div style="height:40px"></div>'

    # Next button will go here
    nextbutton=f"""<div class="next" id="{div_id}-next" onclick="window.checkFlip('{div_id}')"> </div> """
    
    #print(nextbutton)
    loadData = '\n'

    loadData += "var cards"+div_id+"="

    if type(ref) == list:
        #print("List detected. Assuming JSON")
        loadData += json.dumps(ref)
        static = True
        url = ""
    elif type(ref) == str:
        if ref[0] == "[":
            loadData += ref
            static = True
            url=""
        elif ref.lower().find("http") == 0:
            url = ref
            file = urllib.request.urlopen(url)
            for line in file:
                loadData += line.decode("utf-8")
            static = False
        else:
            #print("File detected")
            with open(ref) as file:
                for line in file:
                    loadData += line
            static = True
            url = ""
    else:
        raise Exception("First argument must be list (JSON), URL, or file ref")

    loadData += ''';
    '''
    
    if static:
        loadData += f'''
        createCards("{div_id}", "{keyControl}");
        '''

        print()
    else:
        loadData += f'''

        {{
        const jmscontroller = new AbortController();
        const signal = jmscontroller.signal;

        setTimeout(() => jmscontroller.abort(), 5000);

        fetch("{url}", {{signal}})
        .then(response => response.json())
        .then(json => createCards("{div_id}", "{keyControl}"))
        .catch(err => {{
        console.log("Fetch error or timeout");
        createCards("{div_id}", "{keyControl}");
        }});
        }}
        '''
        #loadData+=url+script_end


    #print(loadData)
    display(HTML(styles))
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

