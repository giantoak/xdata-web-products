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
import datetime


logging.basicConfig(filename=os.path.dirname(os.path.realpath(__file__))+"/ss_dump.log", filemode='w', level=logging.DEBUG)
logging.warning("ss_dump: called.")
fileName = os.path.dirname(os.path.realpath(__file__)) + "/enron.RData"
robjects.r['load'](fileName)

ss=com.load_data('ss.df2')

logging.warning("ss_dump: processing: " + type(ss).__name__)

def mapRelativeDates(results, startDate):
	x = "x"
	date = "date"
	out = []
	sd = datetime.datetime.strptime(startDate, "%Y-%m-%d")
	
	logging.warning("start date: " + sd.isoformat())
	working = json.loads(results)
	for v in working:
		
		dt = sd + datetime.timedelta(weeks=v[x])
		v[date] = dt.strftime("%Y-%m-%d")
		out.append(v)
		
	return out

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
	
	results = json.dumps(mapRelativeDates(results, "1999-12-31"))
	
	if start is None:
		
		logging.warning("ss_dump: no query string defined - returning whole set")
	else:
		
		logging.warning("ss_dump: query string defined: Start = %s", start)
		
		# filter out subset requested by user.3
		
		if (end is None):
			
			results = json.dumps(subrange(results, start, results[-1].x))
		
		else:	
			logging.warning("ss_dump: query string defined with End = %s",  end)
			

			results = json.dumps(subrange(results, start, end))
			
	logging.warning("%s", results)
			
	return results

