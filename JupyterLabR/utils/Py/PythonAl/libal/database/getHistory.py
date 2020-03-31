import requests
import pandas as pd
import getpass
import re
from .getUserToken import getUserToken
from ._config import _CONFIG_API_GETHISTORY_ENDPOINT
from ._config import _CONFIG_BETA_API_GETHISTORY_ENDPOINT

# import pdb

def getHistory(ticker,field,database,debug=False,beta=False):
    '''
        Lowest level DAL to call the getHistory api
        Input
            ticker(str) : comma seperated ticker names
            field(str) : comma seperated field name
            database(str) : database name
            debug(bool): set to True to print request
        Output
            Pandas dataframe
        Example
            data = getHistory("USDAUD Curncy","close_price","security")
            data = getHistory(["USDAUD Curncy","USDJPY Curncy"],"close_price","security")
    '''
    user = getpass.getuser()
    # parse list fields
    if(type(field) is not list):
        field = [field.lower()]
    if field == ['ohlc']:
        field = ["open price","high price","low price","close price"]
    if field == ['ohlcv']:
        field = ["open price","high price","low price","close price","volume"]
    field = [re.sub(" ","_",i.lower()) for i in field]
    fieldparse = ','.join(field)
    # parse list tickers
    if(type(ticker) is not list):
        ticker = [ticker]
    tickerparse = ','.join(ticker)
    # build request
    tok = getUserToken(beta=beta)
    if beta:
        url = _CONFIG_BETA_API_GETHISTORY_ENDPOINT
    else:
        url = _CONFIG_API_GETHISTORY_ENDPOINT
    request = url+database+'?field='+fieldparse+'&ticker='+tickerparse+"&alsid="+tok+"&aluser="+user
    if debug:
        print(request)
    response = requests.get(request)
    if response.json()['success'] == False:
        raise ValueError(response.json()['message'])
    out = response.json()['data']
#     pdb.set_trace()
    # parsing json 
    df = pd.DataFrame()
    # 3 cases here. throw error for all other cases
    ## 1. 1 ticker 1 field
    ## 2. 1 ticker >1 field
    ## 3. >1 ticker 1 field
    if(len(ticker) == 1 and len(field) > 1): # for case 2
        ticker = ticker[0]
        for fld in field:
            tmp = pd.DataFrame(out[ticker][fld])
            tmp.columns = ['date',fld]
            tmp = tmp.set_index('date')
            df = df.join(tmp,how='outer')  
    elif(len(field) == 1): # for cases 1 and 3
        field = field[0]
        for tick in ticker:
            tmp = pd.DataFrame(out[tick][field])
            tickcolnam = re.sub(" Curncy| Index| Equity| Comdty","",tick,flags=re.IGNORECASE)
            tmp.columns = ['date',tickcolnam]
            tmp = tmp.set_index('date')
            df = df.join(tmp,how='outer')
    else:
        raise ValueError("Multiple tickers AND fields are currently not supported!")
    return df
