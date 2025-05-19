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


rate = yf.Ticker("^IRX").fast_info.last_price

# gets interest rate from 13-week treasury (in percent, ex. 4.3%)
# def getIRateCached():
#     irate = redis_client.get("13weekInterest")
    
#     if(irate is None):
#         rate = yf.Ticker("^IRX").fast_info.last_price
#         redis_client.set("13weekInterest", rate)
#         return {"13weekInterest": rate}
#     else:
#         return {"13weekInterest": irate}

# Given ticker, exp, and type, gets cached options tables for all calls and puts
# <ticker>-<exp>-<c for call or p for put> ex aapl-20250523-c
# type can be either c, p, or a for all 
def getOptionsTableGreeks(ticker: str, exp: str, type: str):
    type = type.lower()
    if(type not in ["c", "p", "a"]):
        return {}

    ticker = ticker.lower()
    stock = yf.Ticker(ticker)
    
    iRate = rate / 100
    stock_price = stock.fast_info.last_price
    calls = None
    puts = None
    
    nyse = mcal.get_calendar('NYSE')
    today = datetime.now().strftime("%Y-%m-%d")
    daysToExp = nyse.schedule(start_date=today, end_date=exp)
    colsToSelect =  ['contractSymbol','lastTradeDate','strike','lastPrice','volume','openInterest','impliedVolatility']
    greekCols = ['contractSymbol','lastTradeDate','strike','lastPrice','volume','openInterest','impliedVolatility', 'delta', 'gamma', 'theta', 'rho', 'vega']

    if(type == 'c' or type == "a"):
        calls = stock.option_chain(exp).calls
        calls = calls[colsToSelect]
        
        calls['Flag'] = 'c'
        calls['S'] = stock_price
        time_to_exp = len(daysToExp) / 252
        calls['tte'] = time_to_exp
        calls['R'] = iRate
        price_dataframe(calls, flag_col='Flag', underlying_price_col='S', strike_col='strike', annualized_tte_col='tte',
                            riskfree_rate_col='R', sigma_col='impliedVolatility', price_col='lastPrice', model='black_scholes', inplace=True)
        
        calls = calls[greekCols]
        
        if(type == 'c'):
            return {"curr_price": stock_price,"calls": calls}    

 
    if(type == 'p' or type == "a"):
        puts = stock.option_chain(exp).puts
        puts = puts[colsToSelect]
        puts['Flag'] = 'p'
        puts['S'] = stock_price
        puts['tte'] = time_to_exp
        puts['R'] = iRate
        price_dataframe(puts, flag_col='Flag', underlying_price_col='S', strike_col='strike', annualized_tte_col='tte',
                        riskfree_rate_col='R', sigma_col='impliedVolatility', price_col='lastPrice', model='black_scholes', inplace=True)
        puts = puts[greekCols]
        
        if(type == 'p'):
            return {"curr_price": stock_price,"puts": puts}
    
    return {"curr_price": stock_price,"calls": calls, "puts": puts}


    
    