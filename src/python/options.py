import pandas as pd
import numpy as np
import yfinance as yf
import json
import logging

from datetime import datetime
from flask import Flask, request
from flask_cors import CORS

def options_chain2(symbol):

    tk = yf.Ticker(symbol)
    # Expiration dates
    exps = tk.options

    # Get options for each expiration
    options = pd.DataFrame()
    for e in exps:
        opt = tk.option_chain(e)
        opt = pd.DataFrame().append(opt.calls).append(opt.puts)
        opt['expirationDate'] = e
        options = options.append(opt, ignore_index=True)

    # Bizarre error in yfinance that gives the wrong expiration date
    # Add 1 day to get the correct expiration date
    options['expirationDate'] = pd.to_datetime(options['expirationDate']) + datetime.timedelta(days = 1)
    options['dte'] = (options['expirationDate'] - datetime.datetime.today()).dt.days / 365
    
    # Boolean column if the option is a CALL
    options['CALL'] = options['contractSymbol'].str[4:].apply(
        lambda x: "C" in x)
    
    options[['bid', 'ask', 'strike']] = options[['bid', 'ask', 'strike']].apply(pd.to_numeric)
    options['mark'] = (options['bid'] + options['ask']) / 2 # Calculate the midpoint of the bid-ask
    
    # Drop unnecessary and meaningless columns
    options = options.drop(columns = ['contractSize', 'currency', 'change', 'percentChange', 'lastTradeDate', 'lastPrice'])

    return options




def options_chain(symbol, exp_date):
    outFile = open('output.txt', 'w')

    msft = yf.Ticker("MSFT")

    tk = msft
    # Expiration dates
    exps = tk.options

    # Get options for each expiration
    # options = pd.DataFrame()
    # for e in exps:
    #     opt = tk.option_chain(e)
    #     #print(type(opt))
    #     opt = pd.concat([opt.calls, options])
    #     #opt = pd.concat([opt.puts, options])
    #     opt['expirationDate'] = e
    #     options = pd.concat([opt, options], ignore_index=True)
        
    #print(options)

    print(type(tk.option_chain(exps[0]).calls))
    optionsDFcalls = pd.DataFrame()
    optionsDFputs = pd.DataFrame()
    optionsDFcalls = pd.concat([tk.option_chain(exps[0]).calls, optionsDFcalls])
    optionsDFputs = pd.concat([tk.option_chain(exps[0]).puts, optionsDFputs])

    # outFile.write(optionsDFcalls.to_string())
    # outFile.write('\n\t\t\t\t\t\t\t_____________________________PUTS___________________________\n')
    # outFile.write(optionsDFputs.to_string())

    optionsDFcalls.to_json('test.json', orient='records')

    outFile.close()



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
    app.logger.info(exps)
    return json.dumps({'exps':exps})

    
@app.route('/options-calls', methods=['POST'])
def options_calls():
    data = request.get_json()
    symbol = data['symbol']
    exp_date = data['exp_date']
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
    app.logger.info(symbol, "    ", exp_date)

    tk = yf.Ticker(symbol)

    optionsDFcalls = pd.DataFrame()
    optionsDFputs = pd.DataFrame()
    optionsDFcalls = pd.concat([tk.option_chain(exp_date).calls, optionsDFcalls])
    optionsDFputs = pd.concat([tk.option_chain(exp_date).puts, optionsDFputs])
    return(optionsDFputs.to_json(orient='records'))


if __name__ == "__main__":
    app.run(port=5500)


