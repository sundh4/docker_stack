from .getHistory import getHistory

def getContract(ticker,field="settlement",debug=False,beta=False):
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
            db.getContract("GCH20 Comdty")
    '''
    data = getHistory(ticker,field,'market',debug=debug,beta=beta)
    return data
