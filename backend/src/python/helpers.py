import time
import pandas as pd
import numpy as np
import yfinance as yf
import json
import datetime
from datetime import datetime
from scipy.stats import norm


from psql import conn


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



def BlackScholes(underlying_price, strike, time_to_exp_days, i_rate_pct, iv_pct, type): 
    N = norm.cdf
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


def executeOrders(data):
    conn.rollback()
    startTime = time.time()
    
    bids = data["bids"]
    asks = data["asks"]
    
    transactionStatus = []
    
    for transaction in bids:
        user_id = int(transaction['user_id'])
        ticker = transaction['ticker']
        quantity = float(transaction['quantity'])
        price = float(data['curr_price'])
        
        statusVar = {
            "hash": transaction['hash'],
            "user_id": user_id,
            "ticker": ticker,
            "status": ''
        }
        
        cur = conn.cursor()
        cur.execute(f'SELECT * FROM "PaperTrading"."Positions" WHERE user_id = {user_id} AND ticker = \'{transaction['ticker']}\'')
        conn.commit()
        rows = cur.fetchall()
        
        if len(rows) == 0:
            try: 
                curInsert = conn.cursor()
                curInsert.execute(f'INSERT INTO "PaperTrading"."Positions" (user_id, ticker, quantity, average_price) VALUES ({user_id}, \'{ticker}\', {quantity}, {price})')
                curInsert.execute(f'UPDATE "PaperTrading"."Positions" SET quantity=quantity-{quantity*price} WHERE (user_id={user_id} AND ticker=\'CASH\')')
                conn.commit()
                curInsert.close()
                statusVar['status'] = 'BOUGHT'
            except: 
                statusVar['status'] = 'ERROR: BUY TRANSACTION NOT COMPLETED'
        else: 
            oldAveragePrice = float(rows[0][4])
            oldQuantity = float(rows[0][3])
            oldTotalPrice = oldAveragePrice * oldQuantity
            
            newPrice =  quantity * price
            newAvgPrice = round((oldTotalPrice + newPrice) / (oldQuantity + quantity), 2)
            print('\n','new average price: ', newAvgPrice, '\n')
            try:
                curUpdate = conn.cursor()
                curUpdate.execute(f'UPDATE "PaperTrading"."Positions" SET quantity={oldQuantity+quantity}, average_price={newAvgPrice} WHERE (user_id={user_id} AND ticker=\'{ticker}\')')
                curUpdate.execute(f'UPDATE "PaperTrading"."Positions" SET quantity=quantity-{quantity*price} WHERE (user_id={user_id} AND ticker=\'CASH\')')
                conn.commit()
                curUpdate.close()
                statusVar['status'] = 'BOUGHT'
            except:
                statusVar['status'] = 'ERROR: BUY TRANSACTION NOT COMPLETED'
                
        transactionStatus.append(statusVar)
        cur.close()
        
    for transaction in asks:
        user_id = int(transaction['user_id'])
        ticker = transaction['ticker']
        quantity = float(transaction['quantity'])
        price = float(data['curr_price'])
        
        statusVar = {
            "hash": transaction['hash'],
            "user_id": user_id,
            "ticker": ticker,
            "status": ''
        }
        
        cur = conn.cursor()
        cur.execute(f'SELECT * FROM "PaperTrading"."Positions" WHERE user_id = {user_id} AND ticker = \'{transaction['ticker']}\'')
        conn.commit()
        rows = cur.fetchall()
        
        if len(rows) == 0:
            statusVar['status'] = 'ERROR: EXISTING POSITION NOT FOUND'
        else: 
            '''
            FIX: average price not computing correctly
            '''
            oldAveragePrice = float(rows[0][4])
            oldQuantity = float(rows[0][3])
            oldTotalPrice = oldAveragePrice * oldQuantity
            
            newPrice =  quantity * price
            newAvgPrice = round((oldTotalPrice - newPrice) / (oldQuantity - quantity), 2)
            print('\n','new average price sell: ', newAvgPrice, '\n')
            try:
                curUpdate = conn.cursor()
                curUpdate.execute(f'UPDATE "PaperTrading"."Positions" SET quantity=quantity-{quantity}, average_price={newAvgPrice} WHERE (user_id={user_id} AND ticker=\'{ticker}\')')
                curUpdate.execute(f'UPDATE "PaperTrading"."Positions" SET quantity=quantity+{quantity*price} WHERE (user_id={user_id} AND ticker=\'CASH\')')
                conn.commit()
                curUpdate.close()
                statusVar['status'] =  'SOLD'
            except:
                statusVar['status'] =  'ERROR: POSITION UNABLE TO SELL'
                
        transactionStatus.append(statusVar)
        cur.close()
        
    print(f'\n------TIME ELAPSED: {time.time()-startTime}------\n')
    return transactionStatus
            
    