import rpy2
import rpy2.robjects as robjects
import numpy as np
import tangelo
import json  
import pandas as pd
import pandas.rpy.common as com
import networkx as nx
import logging
from networkx.readwrite import json_graph
import os


logging.basicConfig(filename=os.path.dirname(os.path.realpath(__file__))+"/ss_dump.log", level=logging.INFO)
logging.warning("ss_dump: called.")
fileName = os.path.dirname(os.path.realpath(__file__)) + "/enron.RData"
robjects.r['load'](fileName)

ss=com.load_data('ss.df2')

logging.warning("ss_dump: processing: " + type(ss).__name__)

def subrange(results, start, end):
	
	x = "x"
	out = []
	working = json.loads(results)
	for v in working:
		
		logging.warning("v= %s", v)
		
		if ((v[x] >= start) and (v[x] <= end)):
			
			out.append(v)
			
	
	return out

@tangelo.types(start=int, end=int)
def run(start=None, end=None):
	
	
	results = ss.to_json(orient="records")
	
	if start is None:
		
		logging.warning("ss_dump: no query string defined - returning whole set")
	else:
		
		logging.warning("ss_dump: query string defined: Start = %s", start)
		
		# filter out subset requested by user.3
		
		if (end is None):
			
			results = subrange(results, start, results[-1].x)
		
		else:	
			logging.warning("ss_dump: query string defined with End = %s",  end)
			

			results = subrange(results, start, end)
			
	logging.warning("%s", results)
			
	return results

