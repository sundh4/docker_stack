from .getHistory import getHistory

def getSecurity(ticker,field="close_price",debug=False,beta=False):
    '''
        Function to get securities data from the database
        Input
            ticker(str) : ticker/list of tickers
            field(str) : field/list of fields
            debug(bool): set to True to print request
        Output
            Pandas dataframe
        Example
            import libal.database as db
            db.getSecurity("USDAUD Curncy") # 1 ticker 1 field
            db.getSecurity(["USDAUD Curncy","USDJPY Curncy"]) # >1 ticker 1 field
            db.getSecurity(["USDAUD Curncy"],field='ohlc') # 1 ticker >1 field
    '''
    data = getHistory(ticker,field,"securities",debug=debug,beta=beta)
    return data
