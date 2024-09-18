import time
import matplotlib
import pandas as pd
import numpy as np
import yfinance as yf
import json
import datetime
from datetime import date, datetime, timedelta
from scipy.stats import norm

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import io

import pandas_market_calendars as mcal
from py_vollib_vectorized import price_dataframe

from yfinanceData import redis_client


matplotlib.use('Agg')

### Options Chains
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


### Black Scholes Equation: Options Profit Calcuator
def BS_CALL(S, K, T, r, sigma):
    N = norm.cdf
    d1 = (np.log(S/K) + (r + sigma**2/2)*T) / (sigma*np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * N(d1) - K * np.exp(-r*T)* N(d2)

def BS_PUT(S, K, T, r, sigma):
    N = norm.cdf
    d1 = (np.log(S/K) + (r + sigma**2/2)*T) / (sigma*np.sqrt(T))
    d2 = d1 - sigma* np.sqrt(T)
    return K*np.exp(-r*T)*N(-d2) - S*N(-d1)

def BlackScholes(curr_price, underlying_price, strike, time_to_exp_days, i_rate_pct, iv_pct, type): 
    N = norm.cdf
    i_rate = i_rate_pct/100
    iv = iv_pct /  100
    time_to_exp = time_to_exp_days / 365
    dv1 = (np.log(curr_price/strike) + (i_rate + iv**2)*time_to_exp)/(iv * np.sqrt(time_to_exp))
    dv2 = dv1 - (iv * np.sqrt(time_to_exp))
    
    if(str.lower(type) == 'calls'):
        # call_price = underlying_price * N(dv1) - N(dv2) * strike * np.exp(-1*i_rate*time_to_exp)
        call_price = BS_CALL(underlying_price, strike, time_to_exp, i_rate, iv)
        return np.around(call_price, 2)
    else:
        put_price = N(-1*dv2)*strike*np.exp(-1*i_rate*time_to_exp) - N(-1*dv1) * underlying_price
        return np.around(put_price, 2)
    
def BlackScholesSeries(current_price, days_to_exp, strike, r, iv, type, max_price, min_price, curr_option_value):
    max_price = round(max_price, 2)
    min_price = round(min_price, 2) - 1
    days = np.arange(days_to_exp, 0, -1)
    underlyings = np.arange(max_price, min_price, (-1 if (max_price-min_price > 10) else -0.5))
    data = np.zeros(shape=(len(underlyings), len(days)))
    
    maxProfit = 0
    maxLoss = 0
    
    for i in range(0, len(underlyings)):
        for j in range(0, len(days)):
            datum = round(BlackScholes(current_price, underlyings[i], strike, days[j], r, iv, type),1)
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



### Historical Volatility Calculators

def calcHV(data: pd.Series, window: int):
    oneDayVol = data.rolling(window).std().dropna()
    yearVol = oneDayVol * 16
    return yearVol

def getHV(ticker, duration, windowSize):
    stock = yf.Ticker(ticker)
    hist = (stock.history(period=duration)).index.strftime('%Y-%m-%d').tolist()[(windowSize-1):]
    histclose = (stock.history(period=duration))['Close']
    returnsArray = np.zeros(shape=(1, len(histclose)))
    
    for i in range(1, len(histclose)):
        returnsArray[0][i-1] = np.log(histclose[i]/histclose[i-1])
    
    histReturns = pd.Series(returnsArray[0])    
    hv = calcHV(histReturns, windowSize)
    
    retDF = {}    
    retDF['hv'] = hv
    retDF['history'] = hist
    retDF['stock_history'] = histclose.iloc[-(len(hist)):]
    
    return retDF

def getPastEarningsDates(ticker):
    stock = yf.Ticker(ticker)   
    earnings = stock.get_earnings_dates()
    return earnings.index.strftime('%Y-%m-%d').tolist()
   
#Generate SVGs from matplotlib for historical volatility   
def getIMG(ticker, duration, windowSize): 
    df = getHV(ticker, duration, windowSize)  
    earnings = getPastEarningsDates('NVDA')
    datesFull = df['history']

    plt.plot(datesFull, df['hv'])
    # plt.gca().xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
    plt.gca().xaxis.set_major_locator(mdates.AutoDateLocator(maxticks=(len(datesFull) / 5)))  # Set a maximum number of ticks
    for date in earnings:
        if(date in datesFull):
            dateObj = datetime.strptime(date, '%Y-%m-%d')
            dateObj += timedelta(days=2)
            text_x_position = datetime.strftime(dateObj, '%Y-%m-%d')
            plt.axvline(x=date, color='red', linestyle='--', lw=2, label='Earnings')
            plt.text(date, max(df['hv'])*1.1, date, color='red', ha='left', va='bottom')
            
    plt.xticks(rotation=90)
    plt.tight_layout()
    
    img = io.BytesIO()
    plt.savefig(img, format='svg')
    img.seek(0)
    plt.close()

    # Get the SVG string
    svg_data = img.getvalue().decode('utf-8')
    print(svg_data)
    
    return {'svg': svg_data}

def getIMG2(ticker, duration, windowSize): 
    df = getHV(ticker, duration, windowSize)  
    earnings = getPastEarningsDates(ticker)
    datesFull = df['history']

    
    fig, ax = plt.subplots(figsize=(12, 6))  # Fixed size 12x6 inches
    ax.plot(datesFull, df['hv'], marker='o', color='blue', label='Stock Price')  # Set line color to blue
    
    for date in earnings:        
        ax.axvline(x=date, color='red', linestyle='--', lw=2, label='Earnings')
        ax.text(date, max(df['hv'])*1.1, date, color='red', ha='left', va='bottom')

    ax.set_xlabel('Date')
    ax.set_ylabel('IV (decimal)')
    ax.set_title('Stock Price with Earnings Dates')
    ax.legend()

    # Set date formatter and locator for better spacing
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    ax.xaxis.set_major_locator(mdates.AutoDateLocator(maxticks=(len(datesFull) / 5)))  # Set a maximum number of ticks

    # Rotate and align the tick labels to avoid overlap
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right")

    # Save plot to a BytesIO object as SVG with tight bounding box
    img = io.BytesIO()
    fig.savefig(img, format='svg', bbox_inches='tight')
    img.seek(0)
    plt.close(fig)

    # Get the SVG string
    svg_data = img.getvalue().decode('utf-8')


    print(svg_data)
    
    return {'svg': svg_data}
   
def getData(ticker, duration, windowSize):
    df = getHV(ticker, duration, windowSize)  
    earnings = getPastEarningsDates(ticker)
    datesFull = df['history']
    vals = df['hv']
    history = df['stock_history']
    
    earningsInTime = []
    
    for earning in earnings:
        if earning in datesFull:
            earningsInTime.append(earning)
    
    retObj = {
        "dates": datesFull,
        "values": vals.to_list(),
        "earnings_dates": earningsInTime,
        "stock_history": history.to_list()
    }
    
    return retObj

# Monte Carlo Simulation for stock prices
def calcMeanOptionsSkew(stock, endtime, pctOTM):
    stockprice = stock.fast_info.last_price
    calls = pd.DataFrame()
    puts = pd.DataFrame()

    targetDate = datetime.strptime(endtime, '%Y-%m-%d')
    expList = stock.options
    expList = [datetime.strptime(exp, '%Y-%m-%d') for exp in expList]   
    expDateChose = min(expList, key=lambda x: abs(x-targetDate))
    expDateChose = datetime.strftime(expDateChose, '%Y-%m-%d')
    
    calls = stock.option_chain(expDateChose).calls
    puts = stock.option_chain(expDateChose).puts
    
    targetCallPrice = stockprice * (1+pctOTM)
    targetPutPrice = stockprice * (1-pctOTM)


    # Calculate adjusted call premium for calls x% OTM
    below_call_target = calls[calls['strike'] <= targetCallPrice]
    above_call_target = calls[calls['strike'] >= targetCallPrice]
    closest_below = below_call_target.loc[below_call_target['strike'].idxmax()]
    closest_above = above_call_target.loc[above_call_target['strike'].idxmin()]
    closest_strikes = [closest_below, closest_above]
    
    closestlowerCall = closest_strikes[0]['strike']
    closestupperCall = closest_strikes[1]['strike']
    
    strikeDiff = closestupperCall - closestlowerCall
    normalizedlowerCallWeight = 1 - (targetCallPrice - closestlowerCall) / strikeDiff
    normalizedupperCallWeight = 1 - normalizedlowerCallWeight
    
    closest_strikes_lower: float
    closest_strikes_upper: float
    if(closest_strikes[0]['bid'] == 0 or closest_strikes[0]['ask'] == 0):
        closest_strikes_lower = closest_strikes[0]['lastPrice']
    else:
        closest_strikes_lower = (closest_strikes[0]['bid'] + closest_strikes[0]['ask'])/2
        
    if(closest_strikes[1]['bid'] == 0 or closest_strikes[1]['ask'] == 0):
        closest_strikes_upper = closest_strikes[1]['lastPrice']
    else:
        closest_strikes_upper = (closest_strikes[1]['bid'] + closest_strikes[1]['ask'])/2
    
    adjCallPremium = normalizedlowerCallWeight*closest_strikes_lower + normalizedupperCallWeight*closest_strikes_upper
    # Calculate adjusted put premium for puts x% OTM
    below_put_target = puts[puts['strike'] <= targetPutPrice]
    above_put_target = puts[puts['strike'] >= targetPutPrice]
    closest_below = below_put_target.loc[below_put_target['strike'].idxmax()]
    closest_above = above_put_target.loc[above_put_target['strike'].idxmin()]
    closest_strikes = [closest_below, closest_above]
    
    closestlowerPut = closest_strikes[0]['strike']
    closestupperPut = closest_strikes[1]['strike']
    
    
    strikeDiff = closestupperPut - closestlowerPut
    normalizedlowerPutWeight = (targetPutPrice - closestlowerPut) / strikeDiff
    normalizedupperPutWeight = 1 - normalizedlowerPutWeight
    
    if(closest_strikes[0]['bid'] == 0 or closest_strikes[0]['ask'] == 0):
        closest_strikes_lower = closest_strikes[0]['lastPrice']
    else:
        closest_strikes_lower = (closest_strikes[0]['bid'] + closest_strikes[0]['ask'])/2
        
    if(closest_strikes[1]['bid'] == 0 or closest_strikes[1]['ask'] == 0):
        closest_strikes_upper = closest_strikes[1]['lastPrice']
    else:
        closest_strikes_upper = (closest_strikes[1]['bid'] + closest_strikes[1]['ask'])/2
    
    adjPutPremium = normalizedlowerPutWeight*closest_strikes_lower+ normalizedupperPutWeight*closest_strikes_upper
    
    # print('adjusted call premium: ', adjCallPremium)
    # print('adjusted put premium: ', adjPutPremium)
    
    skew = (adjCallPremium - adjPutPremium) / ( (adjCallPremium + adjPutPremium) /2 )
    
    return skew

def runMonteCarlo(ticker, useHistorical, durationHistorical, endtime, pctOTM, numSims, riskFreeRate):
    
    nyse = mcal.get_calendar('NYSE')
    early = nyse.schedule(start_date=(date.today()).strftime('%Y-%m-%d'), end_date=endtime)
    dates = mcal.date_range(early, frequency='1D')
    
    numDays = len(dates)
    
    starttime = time.time()
    stock = yf.Ticker(ticker)
    histclose = (stock.history(period=durationHistorical))['Close']
    
    log_returns = np.log(histclose/histclose.shift(1)).dropna()
    volatility = log_returns.rolling(window=5).std()
    volatility = volatility.iloc[-1]
    
    mu = np.sum(log_returns) / len(log_returns)
    # print('mu: ', mu, '\n')
   
    # print('\n\nvolatility: ', volatility)
    
    initalPrice = histclose.iloc[-1]
    # print('\n\nS0: ', initalPrice)
    dt = 1
    num_t = numDays
    i_rate = riskFreeRate / 252
    
    predictions = np.zeros(shape=(num_t+1, numSims))
    predictions[0] = initalPrice
    
    # print('simulated vol', np.random.standard_normal(NUM_SIMS))
    
    skew = calcMeanOptionsSkew(stock, endtime, pctOTM)
    print(f'skew = {skew}')
    
    for t in range(1, num_t+1):
        predictions[t] = predictions[t-1] * np.exp(( (mu if useHistorical else i_rate) - 0.5*volatility**2)*dt 
                        + volatility*np.sqrt(dt)*np.random.normal(skew/np.sqrt(num_t), 1, numSims))
    
    dp = np.mean((predictions[-1] - initalPrice)) / initalPrice
    print('predicted price change: ', dp*100, '%')    
    print(f'--------{time.time()-starttime} seconds--------')
    
    return dp

# Extra Options Analysis Tools

def getOptionsDataWithGreeks(stock: yf.Ticker, exp: str, iRate: float):
    calls = stock.option_chain(exp).calls
    puts = stock.option_chain(exp).puts
    stock_price = stock.fast_info.last_price
    
    nyse = mcal.get_calendar('NYSE')
    today = datetime.now().strftime("%Y-%m-%d")
    daysToExp = nyse.schedule(start_date=today, end_date=exp)
    
    colsToSelect =  ['contractSymbol','lastTradeDate','strike','lastPrice','volume','openInterest','impliedVolatility']
    calls = calls[colsToSelect]
    puts = puts[colsToSelect]
    
    calls['Flag'] = 'c'
    calls['S'] = stock_price
    time_to_exp = len(daysToExp) / 252
    calls['tte'] = time_to_exp
    calls['R'] = iRate
    price_dataframe(calls, flag_col='Flag', underlying_price_col='S', strike_col='strike', annualized_tte_col='tte',
                     riskfree_rate_col='R', sigma_col='impliedVolatility', model='black_scholes', inplace=True)
    
    puts['Flag'] = 'c'
    puts['S'] = stock_price
    puts['tte'] = time_to_exp
    puts['R'] = iRate
    price_dataframe(puts, flag_col='Flag', underlying_price_col='S', strike_col='strike', annualized_tte_col='tte',
                    riskfree_rate_col='R', sigma_col='impliedVolatility', model='black_scholes', inplace=True)
    
    greekCols = ['contractSymbol','lastTradeDate','strike','lastPrice','volume','openInterest','impliedVolatility', 'delta', 'gamma', 'theta', 'rho', 'vega']
    calls = calls[greekCols]
    puts = puts[greekCols]
    
    return {'calls': calls, 'puts': puts}

# Get Most Updated Tickers
def getTickerTapeStocks():
    tickerTape = redis_client.get("tickerTape")
    if tickerTape is None:
        tickers = ['NVDA', 'GOOGL', 'AAPL', 'TSLA', 'MSFT', 'META', 'AMZN', 'AMD', 'INTC', 'MSTR', 'GS', 'V', 'SPY', 'QQQ']
        prices = []
        openPositive = []
        for ticker in tickers:
            stock = yf.Ticker(ticker)
            prices.append(round(stock.fast_info.last_price, 2))
            if(stock.fast_info.last_price > stock.fast_info.regular_market_previous_close):
                openPositive.append(1)
            else: openPositive.append(0)
            
        stocksData = {"tickers": tickers, "prices": prices, "direction": openPositive}
        grouped_data = [
            {"ticker": a1, "price": a2, "action": a3}
            for a1, a2, a3 in zip(stocksData["tickers"], stocksData["prices"], stocksData["direction"])
        ]
        redis_client.set("tickerTape", json.dumps(grouped_data), ex=60)
        
        return grouped_data
    
    else:
        return json.loads(tickerTape)
    
    
    
