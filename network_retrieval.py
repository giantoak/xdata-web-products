import networkx as nx
import tangelo
from networkx.readwrite import json_graph
import pandas as pd
import os
import logging
import sys


def run(date=""):

	logging.basicConfig(filename=os.path.dirname(os.path.realpath(__file__))+"/network_retrieval.log", filemode='w', level=logging.DEBUG)
	logging.warning("newtork_retrieval(" + date + "): called.")

	ER=pd.DataFrame.from_csv(os.path.dirname(os.path.realpath(__file__)) + '/weeks.csv',sep="\t")
	sub_ER=ER[(ER['V2'] == int(date))] #& (ER['sender'] == 155)]
	g=nx.Graph(zip(sub_ER['sender'],sub_ER['receiver']))
#	ec=nx.eigenvector_centrality(g)
#	nx.set_node_attributes(g,'eigcen',ec)
	deg=g.degree()
	nx.set_node_attributes(g,'degree',deg)
	bc=nx.betweenness_centrality(g)
	nx.set_node_attributes(g,'betweenness',bc)
#	logging.warning("sub_er %s" % sub_ER)
#	try: 
#		logging.warning("calculating nx.eigenvector_centrality")
#		ec=nx.eigenvector_centrality(g)
#		logging.warning("ec=" + ec)
#		nx.set_node_attributes(g,'eigcen',ec)
#	except:
#		e=sys.exc_info()[0]
#		logging.warning("nx.eigenvector_centrality threw exception: %s" % e)
#		pass
#	try:
#		logging.warning("calculating nx.degree")
#		deg=g.degree()
#		logging.warning("deg=" + deg)
#		nx.set_node_attributes(g,'degree',deg)
#	except:
#		e=sys.exc_info()[0]
#		logging.warning("nx.degree threw exception: %s" % e)
#		pass
#	try:
#		logging.warning("calculating nx.betweenness")
#		bc=nx.betweenness_centrality(g)
#		logging.warning("bc=" + bc)
#		nx.set_node_attributes(g,'betweenness',bc)
#	except:
#		e=sys.exc_info()[0]
#		logging.warning("nx.betweenness threw exception: %s" % e)
#		pass
#	
#	logging.warning("returning: " + json_graph.dumps(g))
	return json_graph.dumps(g)
	#return 0
