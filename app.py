#import dependencies
import pandas as pd
import json
from flask import Flask, render_template,jsonify

# Imports the method used for connecting to DBs
from sqlalchemy import create_engine

# Imports the methods needed to abstract classes into tables
from sqlalchemy.ext.declarative import declarative_base

# Allow us to declare column types
from sqlalchemy import Column, Integer, String, Float ,Date

from sqlalchemy.orm import Session

from sqlalchemy import inspect

# ===========================Database Connection========================

# Create Database Connection
engine = create_engine('sqlite:///belly_button_biodiversity.sqlite')
conn = engine.connect()
#Base.metadata.create_all(conn)
session = Session(bind=engine)

# ===========================Dataframe Creation==========================

# Create dataframe from the sqlite database
otu_df = pd.read_sql_query('SELECT * FROM otu ;', conn)
otu_df = otu_df.rename(columns={'lowest_taxonomic_unit_found': 'description'})
samples_df = pd.read_sql_query('SELECT * FROM samples ;', conn)
samples_metadata_df = pd.read_sql_query('SELECT * FROM samples_metadata ;', conn)
samples_enhancedata_df=samples_metadata_df.drop(['WFREQ','LOCATION','COUNTRY012', 'ZIP012','COUNTRY1319', 'ZIP1319', 'DOG','EVENT',
       'CAT', 'IMPSURFACE013', 'NPP013', 'MMAXTEMP013', 'PFC013',
       'IMPSURFACE1319', 'NPP1319', 'MMAXTEMP1319', 'PFC1319'], axis=1)
# ===========================Flask Connection==========================
app = Flask(__name__)


@app.route('/')
# Return the dashboard homepage.
def index():
    return render_template('index.html')


@app.route('/names')
# List of sample names.
def names():
    # get the samples name
    samples_name=samples_df.columns.values.tolist()
    samples_name=samples_name[1:]
    return jsonify(samples_name)


@app.route('/otu')
# List of OTU descriptions
def otu():
    # get the otu descriptions
    otu_describe=otu_df.to_dict('records')
    return jsonify(otu_describe)

@app.route('/metadata/<sample>')
# MetaData for a given sample
def metadata(sample):

    item=sample.split("_")
    id=int(item[1])
    # sample_metadata=samples_enhancedata_df.to_dict(orient='records')
    sample_metadata=samples_enhancedata_df.loc[samples_enhancedata_df["SAMPLEID"]==id]
    result=sample_metadata.to_dict(orient='records')
    return jsonify(result)

@app.route('/wfreq/<sample>')
# Weekly Washing Frequency as a number
def wfreq(sample):
    item=sample.split("_")
    id=int(item[1])
    # freq=samples_metadata_df.loc[samples_enhancedata_df["SAMPLEID"]==id].WFREQ
    freq=samples_metadata_df.loc[samples_enhancedata_df["SAMPLEID"]==id,'WFREQ'].iloc[0]
    # print("freq=",freq.values)
    # data={"wfreq": freq.values[0]}
    # return jsonify(data)
    return jsonify(freq)

@app.route('/samples/<sample>')
# OTU IDs and Sample Values for a given sample
def sam_values(sample):
    
    item = samples_df.loc[:,["otu_id",sample]]
    item=item.rename(columns = {sample:'Sample_id'})
    item=item.sort_values('Sample_id',ascending=False)
    output1=item['otu_id'].tolist()
    output2=item['Sample_id'].tolist()
    result_list=[{'otu_id':output1},{'Sample_id':output2}]
    return jsonify(result_list)


if __name__ == "__main__":

    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug = True, port = 5000)