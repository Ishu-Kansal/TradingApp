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

N = norm.cdf

def BlackScholes(underlying_price, strike, time_to_exp_days, i_rate_pct, iv_pct, type): 
    i_rate = i_rate_pct/100
    iv = iv_pct /  100
    time_to_exp = time_to_exp_days / 365
    dv1 = (np.log(underlying_price/strike) + (i_rate + iv**2)*time_to_exp)/(iv * np.sqrt(time_to_exp))
    dv2 = dv1 - (iv * np.sqrt(time_to_exp))
    
    if(str.lower(type) == 'calls'):
        call_price = underlying_price * N(dv1) - N(dv2) * strike * np.exp(-1*i_rate*time_to_exp)
        return np.around(call_price, 2)
    else:
        put_price = N(-1*dv2)*strike*np.exp(-1*i_rate*time_to_exp) - N(-1*dv1) * underlying_price
        return np.around(put_price, 2)
    
def BlackScholesSeries(current_price, days_to_exp, strike, r, iv, type, max_price, min_price, curr_option_value):
    max_price = round(max_price, 2)
    min_price = round(min_price, 2)
    days = np.arange(days_to_exp, 0, -1)
    underlyings = np.arange(max_price, min_price, (-1 if (max_price-min_price > 10) else -0.5))
    data = np.zeros(shape=(len(underlyings), len(days)))
    
    maxProfit = 0
    maxLoss = 0
    
    for i in range(0, len(underlyings)):
        for j in range(0, len(days)):
            datum = round(BlackScholes(underlyings[i], strike, days[j], r, iv, type),1)
            if(datum > maxProfit):
                maxProfit = datum
            if(datum < maxLoss):
                maxLoss = datum
            data[i][j] = datum
    jsonData = {}
    
    jsonData['data'] = data.tolist()
    jsonData['curr_option_price'] = curr_option_value
    jsonData['price_series'] = underlyings.tolist()
    jsonData['days_series'] = days.tolist()
    jsonData['max_profit'] = maxProfit
    jsonData['max_loss'] = maxLoss
    
    finalJson = json.dumps(jsonData)
    return finalJson

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
    curr_option_value = (optionToQuery['bid'].values[0] + optionToQuery['ask'].values[0])/2
    # print('iv: ', iv, '\n\n\n\n\n\n\n\n\n')
    
    outData = BlackScholesSeries(current_price, DTE, strike, r, iv*100, option_type, max_price, min_price, curr_option_value)
    # print(outData)
    return(outData)

if __name__ == "__main__":
    app.run(port=5500)


