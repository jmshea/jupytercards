#!/usr/bin/env python3
import os
import re
import json
import sys

def extract_defns(directory, chapter):
    pattern = re.compile("DEFIN")
    defns=[]
    chdefns=[]
    fileroot=""
    flashcards=directory+'/flashcards/'
    print(flashcards)


    print("scanning directory: ", directory)
    for filename in os.listdir(directory):
        if filename.endswith(".ipynb"):

                
            with open(directory + "/" + filename,'r') as file:
               
                if len(defns)>0:
                    print(fileroot, len(defns))
                    print(defns)
                    print("\n\n")
                    #return defns
                    if not os.path.isdir(flashcards):
                        os.makedirs(flashcards)
                    outfile=flashcards+fileroot+'.json'
                    print(outfile)
                    with open(outfile,'w') as out:
                        json.dump(defns,out,indent=4)

                fileroot=filename.split('.')[0]
                #print(fileroot)
                defns=[]
                defn_start=0
                for line in file:
                    for match in re.finditer(pattern, line):
                        defn_start=1

                    if defn_start>0:
                        if defn_start==4:
                            term=line.replace('",','')
                            term=term.replace('"','')


                            term=term.strip()
                            term=term.replace("\\n","")
                            #print(term)
                        if defn_start==5:
                            defn=line.replace('",','')
                            defn=defn.replace('"','')
                            defn=defn.replace(':','')
                            defn=defn.strip()
                            defn=defn.replace("\\n","")
                            defns+=[{"front":term, "back":defn}]
                            chdefns+=[{"front":term, "back":defn}]
                            
                        
                        #print(defn_start, line)
                        defn_start+=1
                    if defn_start==6:
                        #print(term,defn)
                        defn_start=0
                        
            
        else:
            continue

    outfile=flashcards+'ch'+str(chapter)+'.json'
    print(outfile)
    with open(outfile,'w') as out:
        json.dump(chdefns,out,indent=4)

def main(args):
	print(args)
	if len(args)==2:
		extract_defns( args[0], int(args[1]) )
	else:
		print("FAILED: expect exactly 2 arguments (directory and chapter number)")

	
if __name__ == "__main__":
	main(sys.argv[1:])
