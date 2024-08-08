import pandas as pd
import numpy as np
import yfinance as yf
import json
import logging
import datetime
from datetime import datetime
from flask import Flask, request
from flask_cors import CORS
from scipy.stats import norm

import helpers


app = Flask(__name__)
CORS(app)
app.debug = True
logging.basicConfig(level=logging.DEBUG)

@app.route('/options-exp', methods=['POST'])
def get_options_exp():
    data = request.get_json()
    print(data)
    symbol = data['symbol']
    stock = yf.Ticker(symbol)
    exps = stock.options
    
    print(type(exps))
    print(exps)
    app.logger.info(exps)
    return json.dumps({'exps':exps})

    
@app.route('/options-calls', methods=['POST'])
def options_calls():
    data = request.get_json()
    symbol = data['symbol']
    exp_date = data['exp_date']
    
    if(not exp_date):
        
        stock = yf.Ticker(symbol)
        exps = stock.options
        exp_date = exps[0]

    
    app.logger.info(symbol, "    ", exp_date)

    tk = yf.Ticker(symbol)

    optionsDFcalls = pd.DataFrame()
    optionsDFcalls = pd.concat([tk.option_chain(exp_date).calls, optionsDFcalls])
    return(optionsDFcalls.to_json(orient='records'))

@app.route('/options-puts', methods=['POST'])
def options_puts():
    data = request.get_json()
    symbol = data['symbol']
    exp_date = data['exp_date']
    
    
    if(not exp_date):
        stock = yf.Ticker(symbol)
        exps = stock.options
        exp_date = exps[0]

        
    app.logger.info(symbol, "    ", exp_date)

    tk = yf.Ticker(symbol)

    optionsDFcalls = pd.DataFrame()
    optionsDFputs = pd.DataFrame()
    optionsDFcalls = pd.concat([tk.option_chain(exp_date).calls, optionsDFcalls])
    optionsDFputs = pd.concat([tk.option_chain(exp_date).puts, optionsDFputs])
    return(optionsDFputs.to_json(orient='records'))

@app.route('/options-profit-calculator', methods=['POST']) 
def options_profit_calculator():
    data = request.get_json()
    
    symbol = data['symbol']
    exp_date = data['exp_date']
    
    tk = yf.Ticker(symbol)
    
    current_price = tk.fast_info.last_price
    nowTime = datetime.today()
    exp_datetime = datetime.strptime(exp_date, '%Y-%m-%d')
    
    DTE = (exp_datetime-nowTime).days + 1
    # print('\n\n\n\n\n\n\n\n\n', DTE)
    
    strike = data['strike']
    r = data['free_rate']
    option_type = data['type']
    max_price = data['max_price']
    min_price = data['min_price']
    
    optionsDFvalues = pd.DataFrame()
    if(option_type == 'calls'):
        optionsDFvalues = pd.concat([tk.option_chain(exp_date).calls, optionsDFvalues])
    else: optionsDFvalues = pd.concat([tk.option_chain(exp_date).puts, optionsDFvalues])
    
    # print('TYPE OF DATAFRAME: ', optionsDFvalues, '\n\n\n\n\n\n\n\n\n')
    optionToQuery = optionsDFvalues.loc[optionsDFvalues['strike'] == strike]
    # print('option: ', optionToQuery)
    iv = optionToQuery['impliedVolatility'].values[0]
    # print(optionToQuery.to_string())
    curr_option_value = (optionToQuery['bid'].values[0] + optionToQuery['ask'].values[0])/2
    last_option_price = optionToQuery['lastPrice'].values[0]
    if(curr_option_value == 0):
        curr_option_value = last_option_price
    # print('iv: ', iv, '\n\n\n\n\n\n\n\n\n')
    
    outData = helpers.BlackScholesSeries(current_price, DTE, strike, r, iv*100, option_type, max_price, min_price, curr_option_value)
    # print(outData)
    return(outData)

if __name__ == "__main__":
    app.run(port=5500, threaded=True, debug=True)

