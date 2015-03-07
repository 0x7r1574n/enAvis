from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

app = Flask(__name__)

URI = 'mongodb://demo:demo@ds043957.mongolab.com:43957/enavis'
DEPTS = ['A A', 'BIO E', 'CE', 'CEE', 'CHEM E', 'CS', 'E E', 'HCDE', 'I E', 'M E', 'MS E', 'PSE']
FIELDS = {'dept': True, 'tot_gpa': True, 'decision': True, 'prereq_gpa': True, 'year': True, 'gender': True,
          'type': True, 'qtr_id': True, 'enrolled': True}

@app.route("/")
def index():
    return render_template('index.html')


@app.route("/database/request")
def request_data():
    c = MongoClient(URI)
    collection = c.enavis.core
    applicants = collection.find(fields=FIELDS)
    json_projects = []
    for applicant in applicants:
        json_projects.append(applicant)
    json_projects = json.dumps(json_projects, default=json_util.default)
    c.disconnect()
    return json_projects

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)