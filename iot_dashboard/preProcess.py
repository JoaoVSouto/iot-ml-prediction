import pandas as pd
import json 
from pandas import json_normalize
import requests
from django.http import JsonResponse

def getData(request):
    payload = {'results': 500}

    field_01 = requests.get('https://api.thingspeak.com/channels/196384/fields/1.json', params=payload)

    #df = pd.read_json(field_01, orient='index')
    field_01 = field_01.json()
    info = json.loads(field_01)

    df = json_normalize(info['feeds'])

    return df

    # site onde vi como transformar json em pandasDF https://www.delftstack.com/pt/howto/python-pandas/json-to-pandas-dataframe/

    #return JsonResponse(field_01.json(), safe=False)